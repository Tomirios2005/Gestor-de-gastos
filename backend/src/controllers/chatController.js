import { runChat } from '../services/groqService.js'
import { insertTransaction, getTransactions } from '../services/transactionService.js'

const CATEGORY_LABELS = {
  food: 'Comida', transport: 'Transporte', entertainment: 'Entretenimiento',
  health: 'Salud', housing: 'Vivienda', clothing: 'Ropa',
  education: 'Educación', salary: 'Sueldo', freelance: 'Freelance',
  investment: 'Inversión', gift: 'Regalo', other: 'Otro'
}

// Maneja cada tool call que el LLM quiera ejecutar
async function handleToolCall(toolName, args, userId) {
  if (toolName === 'register_transaction') {
    const data = await insertTransaction(args, userId)
    return { data }
  }

  if (toolName === 'get_transactions') {
    const transactions = await getTransactions(userId, args)
    // Agregamos antes de devolver al LLM para ahorrar tokens
    const summary = aggregate(transactions)
    return { transactions: transactions.slice(0, 20), summary }
  }

  if (toolName === 'get_summary') {
    const transactions = await getTransactions(userId, args)
    return aggregate(transactions)
  }

  return { error: 'Tool desconocida' }
}

function aggregate(transactions) {
  const totalIncome  = transactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)

  const byCategory = Object.entries(
    transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        const label = CATEGORY_LABELS[t.category] ?? t.category
        acc[label] = (acc[label] ?? 0) + Number(t.amount)
        return acc
      }, {})
  ).map(([category, total]) => ({ category, total }))
   .sort((a, b) => b.total - a.total)

  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    count: transactions.length,
    byCategory
  }
}

export default async function handleMessage(req, res) {
  try {
    const { message } = req.body
    const userId = req.user.id

    if (!message?.trim()) {
      return res.status(400).json({ error: 'El mensaje no puede estar vacío' })
    }

    const today = new Date().toISOString().split('T')[0]

    const result = await runChat({
      message,
      today,
      onToolCall: (toolName, args) => handleToolCall(toolName, args, userId)
    })

    return res.status(200).json({
      success: true,
      reply: result.reply,
      transaction: result.transaction ?? null
    })

  } catch (error) {
    console.error('[chatController]', error)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}