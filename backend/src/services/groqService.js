import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const SYSTEM_PROMPT = `Sos un asistente de finanzas personales en español rioplatense.
Podés hacer dos cosas:
1. Registrar gastos e ingresos cuando el usuario los menciona
2. Consultar y analizar los gastos/ingresos existentes cuando el usuario pregunta

Para registrar usá register_transaction.
Para consultar usá get_transactions o get_summary según corresponda.
Si el usuario saluda o hace una pregunta general, respondé sin usar tools.

Cuando respondas con datos financieros, sé concreto y útil. 
Usá pesos argentinos (ARS) y formato local.`

const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'register_transaction',
      description: 'Registra un gasto o ingreso nuevo cuando el usuario lo menciona',
      parameters: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['expense', 'income'],
            description: 'Tipo de transacción'
          },
          amount: {
            type: 'number',
            description: 'Monto en pesos argentinos'
          },
          category: {
            type: 'string',
            enum: ['food', 'transport', 'entertainment', 'health', 'housing', 'clothing', 'education', 'salary', 'freelance', 'investment', 'gift', 'other'],
            description: 'Categoría de la transacción'
          },
          description: {
            type: 'string',
            description: 'Descripción breve del gasto o ingreso'
          },
          date: {
            type: 'string',
            description: 'Fecha en formato YYYY-MM-DD. Si no se menciona, usar la fecha de hoy.'
          }
        },
        required: ['type', 'amount', 'category', 'description', 'date']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_transactions',
      description: 'Consulta transacciones existentes del usuario con filtros opcionales',
      parameters: {
        type: 'object',
        properties: {
          from: {
            type: 'string',
            description: 'Fecha de inicio en formato YYYY-MM-DD'
          },
          to: {
            type: 'string',
            description: 'Fecha de fin en formato YYYY-MM-DD'
          },
          type: {
            type: 'string',
            enum: ['expense', 'income'],
            description: 'Filtrar por tipo. Omitir para traer ambos.'
          },
          category: {
            type: 'string',
            description: 'Filtrar por categoría'
          }
        },
        required: []
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_summary',
      description: 'Obtiene totales y balance del usuario para un período',
      parameters: {
        type: 'object',
        properties: {
          from: {
            type: 'string',
            description: 'Fecha de inicio en formato YYYY-MM-DD'
          },
          to: {
            type: 'string',
            description: 'Fecha de fin en formato YYYY-MM-DD'
          }
        },
        required: []
      }
    }
  }
]

export async function runChat({ message, today, onToolCall }) {
  const messages = [
    { role: 'system', content: `${SYSTEM_PROMPT}\nFecha de hoy: ${today}` },
    { role: 'user', content: message }
  ]

  // Primera llamada — el LLM decide si usar una tool o responder directo
  const first = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',  
    messages,
    tools: TOOLS,
    tool_choice: 'auto',
    temperature: 0.2,
    max_tokens: 500
  })

  const firstChoice = first.choices[0].message

  // Si no llamó ninguna tool, respondió directo
  if (!firstChoice.tool_calls?.length) {
    return { reply: firstChoice.content, transaction: null }
  }

  // Ejecutar cada tool call
  const toolCall = firstChoice.tool_calls[0]
  const toolName = toolCall.function.name
  const toolArgs = JSON.parse(toolCall.function.arguments)

  const toolResult = await onToolCall(toolName, toolArgs)

  // Segunda llamada — LLM responde con los datos de la tool
  const second = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      ...messages,
      firstChoice,
      {
        role: 'tool',
        tool_call_id: toolCall.id,
        content: JSON.stringify(toolResult)
      }
    ],
    temperature: 0.3,
    max_tokens: 500
  })

  return {
    reply: second.choices[0].message.content,
    transaction: toolName === 'register_transaction' ? toolResult.data : null,
    toolName
  }
}