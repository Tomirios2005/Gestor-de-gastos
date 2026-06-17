import { useEffect, useState } from 'react'
import {useTransactions} from '../context/TransactionContext'
import { useAuth } from '../hooks/useAuth'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'
import type {Transaction} from '../lib/models'

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
  const {transactions,isLoading} = useTransactions()

  
  console.log(transactions)
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const balance = totalIncome - totalExpense

  const categoryData = groupByCategory(transactions)

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] ?? 'ahí'

  if (isLoading) return (
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