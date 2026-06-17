import { useState, useRef, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface TransactionCard {
  type: 'expense' | 'income'
  amount: number
  category: string
  description: string
  date: string
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  text: string
  transaction?: TransactionCard
  loading?: boolean
}

const CATEGORY_LABELS: Record<string, string> = {
  food: 'Comida', transport: 'Transporte', entertainment: 'Entretenimiento',
  health: 'Salud', housing: 'Vivienda', clothing: 'Ropa',
  education: 'Educación', salary: 'Sueldo', freelance: 'Freelance',
  investment: 'Inversión', gift: 'Regalo', other: 'Otro'
}

const SUGGESTIONS = [
  'Gasté $3500 en el super',
  'Cobré el sueldo $250000',
  'Almorcé $1800 en el centro',
  'Pagué Spotify $2000',
]

export default function Chat() {
  // const { session } = useAuth()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      text: '¡Hola! Contame un gasto o ingreso y lo registro automáticamente. Por ejemplo: "gasté $3500 en el super".'
    }
  ])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(text: string) {
    if (!text.trim() || sending) return

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text }
    const loadingMsg: Message = { id: `${Date.now()}-loading`, role: 'assistant', text: '', loading: true }

    setMessages(prev => [...prev, userMsg, loadingMsg])
    setInput('')
    setSending(true)

    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession()

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentSession?.access_token}`
        },
        body: JSON.stringify({ message: text })
      })

      const data = await res.json()

      const assistantMsg: Message = {
        id: `${Date.now()}-reply`,
        role: 'assistant',
        text: data.reply ?? data.error ?? 'Error inesperado',
        transaction: data.success ? data.transaction : undefined
      }

      setMessages(prev => prev.filter(m => !m.loading).concat(assistantMsg))
    } catch {
      setMessages(prev => prev.filter(m => !m.loading).concat({
        id: `${Date.now()}-err`,
        role: 'assistant',
        text: 'No se pudo conectar con el servidor.'
      }))
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto">
      {/* Chat Header */}
      <div className="flex items-center gap-3 px-8 py-6 border-b border-white/5">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-sm">✦</div>
        <div>
          <p className="text-sm font-semibold text-white">Asistente IA</p>
          <p className="text-xs text-gray-400">Registrá gastos e ingresos hablando</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-3">
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-1">
                ✦
              </div>
            )}
            <div className={msg.role === 'user' ? 'flex flex-col items-end' : 'flex flex-col'}>
              <div className={`px-4 py-2 rounded-2xl ${
                msg.role === 'user'
                  // ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-br-none'
                  : 'bg-slate-800 text-gray-100 border border-white/5 rounded-bl-none'
              }`}>
                {msg.loading ? (
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                ) : (
                  <span className="text-sm">{msg.text}</span>
                )}
              </div>
              {msg.transaction && <TransactionBubble t={msg.transaction} />}
            </div>
          </div>
        ))}

        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2 mt-8">
            {SUGGESTIONS.map(s => (
              <button 
                key={s}
                onClick={() => sendMessage(s)}
                className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 text-sm rounded-full transition-all hover:-translate-y-0.5"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-white/5 px-8 py-6 flex gap-3">
        <input
          ref={inputRef}
          type="text"
          className="input flex-1"
          placeholder="Escribí un gasto o ingreso..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={sending}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || sending}
          className="w-11 h-11 bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center transition-all active:scale-95"
        >
          ➤
        </button>
      </div>
    </div>
  )
}

function TransactionBubble({ t }: { t: TransactionCard }) {
  const formatted = new Intl.NumberFormat('es-AR', {
    style: 'currency', currency: 'ARS'
  }).format(t.amount)

  const dateFormatted = new Date(t.date + 'T00:00:00').toLocaleDateString('es-AR', {
    day: '2-digit', month: 'short', year: 'numeric'
  })

  return (
    <div className="mt-2 px-4 py-3 bg-slate-800 border border-white/10 rounded-lg min-w-max">
      <div className="mb-2">
        <span className={`text-xs font-semibold uppercase tracking-wider px-2 py-1 rounded-full ${
          t.type === 'expense'
            ? 'bg-red-500/20 text-red-300 border border-red-500/30'
            : 'bg-green-500/20 text-green-300 border border-green-500/30'
        }`}>
          {t.type === 'expense' ? 'Gasto' : 'Ingreso'}
        </span>
      </div>
      <div className={`text-xl font-bold mb-2 ${
        t.type === 'expense' ? 'text-red-400' : 'text-green-400'
      }`}>
        {formatted}
      </div>
      <div className="text-xs text-gray-400 space-x-1">
        <span>{CATEGORY_LABELS[t.category] ?? t.category}</span>
        <span>·</span>
        <span>{t.description}</span>
        <span>·</span>
        <span>{dateFormatted}</span>
      </div>
    </div>
  )
}