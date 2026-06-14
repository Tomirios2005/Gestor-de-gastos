import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'

interface Transaction {
  id: string
  type: 'expense' | 'income'
  amount: number
  category: string
  description: string
  date: string
}

const CATEGORY_LABELS: Record<string, string> = {
  food: 'Comida', transport: 'Transporte', entertainment: 'Entretenimiento',
  health: 'Salud', housing: 'Vivienda', clothing: 'Ropa',
  education: 'Educación', salary: 'Sueldo', freelance: 'Freelance',
  investment: 'Inversión', gift: 'Regalo', other: 'Otro'
}

const CATEGORY_COLORS = [
  '#8b5cf6', '#3b82f6', '#06b6d4', '#10b981',
  '#f59e0b', '#ef4444', '#ec4899', '#84cc16'
]

function fmt(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)
}

function getLast3MonthsRange() {
  const to = new Date()
  const from = new Date()
  from.setMonth(from.getMonth() - 2)
  from.setDate(1)
  return {
    from: from.toISOString().split('T')[0],
    to: to.toISOString().split('T')[0]
  }
}

function groupByMonth(transactions: Transaction[]) {
  const map: Record<string, { month: string, income: number, expense: number }> = {}

  transactions.forEach(t => {
    const [year, month] = t.date.split('-')
    const key = `${year}-${month}`
    const label = new Date(`${year}-${month}-01`).toLocaleDateString('es-AR', { month: 'short', year: '2-digit' })

    if (!map[key]) map[key] = { month: label, income: 0, expense: 0 }
    if (t.type === 'income') map[key].income += t.amount
    else map[key].expense += t.amount
  })

  return Object.values(map).sort((a, b) => a.month.localeCompare(b.month))
}

function groupByCategory(transactions: Transaction[]) {
  const map: Record<string, number> = {}
  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      map[t.category] = (map[t.category] ?? 0) + t.amount
    })

  return Object.entries(map)
    .map(([category, value]) => ({ name: CATEGORY_LABELS[category] ?? category, value }))
    .sort((a, b) => b.value - a.value)
}

export default function Dashboard() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { from, to } = getLast3MonthsRange()
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .gte('date', from)
        .lte('date', to)
        .order('date', { ascending: true })

      if (!error && data) setTransactions(data)
      setLoading(false)
    }
    load()
  }, [])

  const totalIncome  = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const balance      = totalIncome - totalExpense

  const monthlyData   = groupByMonth(transactions)
  const categoryData  = groupByCategory(transactions)

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] ?? 'ahí'

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="w-8 h-8 border-4 border-white/10 border-t-purple-500 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-7">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Hola, {firstName} 👋</h1>
        <p className="text-sm text-gray-400">Resumen de los últimos 3 meses</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className={`card p-5 ${balance >= 0 ? 'border-green-500/20' : 'border-red-500/20'}`}>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Balance</p>
          <p className={`text-2xl font-bold mt-1 ${balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {fmt(balance)}
          </p>
          <p className="text-xs text-gray-500 mt-2">{balance >= 0 ? 'Superávit' : 'Déficit'}</p>
        </div>
        <div className="card p-5 border-green-500/20">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Ingresos</p>
          <p className="text-2xl font-bold text-green-400 mt-1">{fmt(totalIncome)}</p>
          <p className="text-xs text-gray-500 mt-2">{transactions.filter(t => t.type === 'income').length} transacciones</p>
        </div>
        <div className="card p-5 border-red-500/20">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Gastos</p>
          <p className="text-2xl font-bold text-red-400 mt-1">{fmt(totalExpense)}</p>
          <p className="text-xs text-gray-500 mt-2">{transactions.filter(t => t.type === 'expense').length} transacciones</p>
        </div>
      </div>

      {/* Charts */}
      {transactions.length === 0 ? (
        <div className="card p-16 text-center">
          <p className="text-4xl mb-4">📊</p>
          <p className="text-gray-300">No hay transacciones en este período.</p>
          <p className="text-sm text-gray-400 mt-2">Usá el Chat IA para registrar tus primeros gastos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {/* Monthly Evolution */}
          <div className="col-span-2 card p-6">
            <h2 className="text-sm font-semibold text-gray-300 mb-4">Evolución mensual</h2>
           <ResponsiveContainer width="100%" height={240}> {/* Subí ligeramente a 240px para dar aire a la leyenda */}
    <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
      <defs>
        {/* Optimizamos opacidades: un poco más bajas (0.2) evita que al cruzarse se opaque el fondo negro */}
        <linearGradient id="gradIncome" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%"  stopColor="#4ade80" stopOpacity={0.2} />
          <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
        </linearGradient>
        <linearGradient id="gradExpense" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%"  stopColor="#f87171" stopOpacity={0.2} />
          <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
        </linearGradient>
      </defs>
      
      {/* Grid más sutil y solo horizontal para no saturar la vista */}
      <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.03)" vertical={false} />
      
      <XAxis 
        dataKey="month" 
        tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} 
        axisLine={false} 
        tickLine={false}
        dy={10} // Empuja las etiquetas un poco hacia abajo para que no peguen al gráfico
      />
      
      <YAxis 
        tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} 
        axisLine={false} 
        tickLine={false} 
        tickFormatter={v => `$${(v/1000).toFixed(0)}k`}
        dx={-5} // Separa ligeramente los números del gráfico
      />
      
      <Tooltip
        contentStyle={{ 
          background: '#1a1a2e', // Un tono ligeramente más claro que tu fondo para que contraste (efecto elevación)
          border: '1px solid rgba(255,255,255,0.08)', 
          borderRadius: 12, 
          fontSize: 13,
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)' // Sombra elegante
        }}
        labelStyle={{ color: 'rgba(255,255,255,0.6)', marginBottom: 6, fontWeight: 500 }}
        itemStyle={{ paddingTop: 2 }}
        formatter={(value: any) => [fmt(Number(value)), '']} // Dejamos que el nombre lo maneje el Key nativo de forma limpia
        cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }} // Línea guía discontinua
      />

      {/* 2. Añadimos la Leyenda nativa con estilos premium */}
      <Legend 
        verticalAlign="top" 
        align="right"
        height={36}
        iconType="circle"
        iconSize={8}
        wrapperStyle={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}
      />
      
      {/* Áreas: Añadimos activeDot para que al pasar el mouse resalte el punto exacto */}
      <Area 
        type="monotone" 
        dataKey="income"  
        name="Ingresos" 
        stroke="#4ade80" 
        strokeWidth={2} 
        fill="url(#gradIncome)" 
        activeDot={{ r: 5, strokeWidth: 0, fill: '#4ade80' }}
      />
      <Area 
        type="monotone" 
        dataKey="expense" 
        name="Gastos"   
        stroke="#f87171" 
        strokeWidth={2} 
        fill="url(#gradExpense)" 
        activeDot={{ r: 5, strokeWidth: 0, fill: '#f87171' }}
      />
    </AreaChart>
  </ResponsiveContainer>
          </div>

          {/* Category Breakdown */}
          {categoryData.length > 0 && (
            <div className="card p-6">
              <h2 className="text-sm font-semibold text-gray-300 mb-4">Gastos por categoría</h2>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#13131f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 13 }}
                    formatter={(value: any) => fmt(Number(value))}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  )
}