import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { getTransactions, insertTransaction } from '../services/transactions'
import{useAuth} from '../hooks/useAuth'
interface Transaction {
  id: string
  type: 'expense' | 'income'
  amount: number
  category: string
  description: string
  date: string
}

const CATEGORIES = [
  { value: 'food',          label: 'Comida' },
  { value: 'transport',     label: 'Transporte' },
  { value: 'entertainment', label: 'Entretenimiento' },
  { value: 'health',        label: 'Salud' },
  { value: 'housing',       label: 'Vivienda' },
  { value: 'clothing',      label: 'Ropa' },
  { value: 'education',     label: 'Educación' },
  { value: 'salary',        label: 'Sueldo' },
  { value: 'freelance',     label: 'Freelance' },
  { value: 'investment',    label: 'Inversión' },
  { value: 'gift',          label: 'Regalo' },
  { value: 'other',         label: 'Otro' },
]

const CAT_LABEL: Record<string, string> = Object.fromEntries(CATEGORIES.map(c => [c.value, c.label]))

function fmt(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)
}

const EMPTY_FORM = { type: 'expense' as 'expense'|'income', amount: '', category: 'other', description: '', date: new Date().toISOString().split('T')[0] }

export default function Transactions() {
  const { session } = useAuth()
  console.log('Transactions component session:', session); // Debugging line to check the session value
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading]           = useState(true)
  const [filterType, setFilterType]     = useState('')
  const [filterCat, setFilterCat]       = useState('')
  const [filterFrom, setFilterFrom]     = useState('')
  const [filterTo, setFilterTo]         = useState('')
  const [showModal, setShowModal]       = useState(false)
  const [editing, setEditing]           = useState<Transaction | null>(null)
  const [form, setForm]                 = useState(EMPTY_FORM)
  const [saving, setSaving]             = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)


  async function load() {
    //todo filters
    setLoading(true)
    const  transactions  = await getTransactions();
    setTransactions(transactions ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [filterType, filterCat, filterFrom, filterTo])

  function openNew() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setShowModal(true)
  }

  function openEdit(t: Transaction) {
    setEditing(t)
    setForm({ type: t.type, amount: String(t.amount), category: t.category, description: t.description, date: t.date })
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditing(null)
    setForm(EMPTY_FORM)
  }

  async function handleSave() {
    if (!form.amount || !form.description || !form.date) return
    setSaving(true)

    const payload = {
      type: form.type,
      amount: parseFloat(form.amount),
      category: form.category,
      description: form.description,
      date: form.date
    }

    if (editing) {
      await supabase.from('transactions').update(payload).eq('id', editing.id)
    } else {
      await insertTransaction(payload)
    }

    setSaving(false)
    closeModal()
    load()
  }

  async function handleDelete(id: string) {
    await supabase.from('transactions').delete().eq('id', id)
    setConfirmDelete(null)
    load()
  }

  function clearFilters() {
    setFilterType('')
    setFilterCat('')
    setFilterFrom('')
    setFilterTo('')
  }

  const hasFilters = filterType || filterCat || filterFrom || filterTo

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Transacciones</h1>
          <p className="text-sm text-gray-400">{transactions.length} resultado{transactions.length !== 1 ? 's' : ''}</p>
        </div>
        <button 
          onClick={openNew}
          className="btn-primary"
        >
          + Nueva
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <select 
          className="input max-w-xs"
          value={filterType} 
          onChange={e => setFilterType(e.target.value)}
        >
          <option value="">Todos los tipos</option>
          <option value="expense">Gastos</option>
          <option value="income">Ingresos</option>
        </select>
        <select 
          className="input max-w-xs"
          value={filterCat} 
          onChange={e => setFilterCat(e.target.value)}
        >
          <option value="">Todas las categorías</option>
          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <input 
          type="date" 
          className="input max-w-xs"
          value={filterFrom} 
          onChange={e => setFilterFrom(e.target.value)}
        />
        <input 
          type="date" 
          className="input max-w-xs"
          value={filterTo}   
          onChange={e => setFilterTo(e.target.value)}
        />
        {hasFilters && (
          <button 
            onClick={clearFilters}
            className="px-3 py-2 text-sm text-gray-400 hover:text-red-400 border border-gray-700 hover:border-red-700 rounded-lg transition-colors"
          >
            ✕ Limpiar
          </button>
        )}
      </div>

      {/* Table or Empty State */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-white/10 border-t-purple-500 rounded-full animate-spin" />
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-4">📋</p>
          <p className="text-gray-400 text-sm">
            {hasFilters ? 'No hay resultados para estos filtros.' : 'No hay transacciones aún.'}
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800 border-b border-white/5">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Descripción</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Categoría</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Tipo</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Monto</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {transactions.map(t => (
                  <tr key={t.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                      {new Date(t.date + 'T00:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: '2-digit' })}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300 max-w-xs truncate">{t.description}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="px-2 py-1 bg-gray-800 text-gray-400 rounded text-xs">
                        {CAT_LABEL[t.category] ?? t.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                        t.type === 'expense'
                          ? 'bg-red-500/20 text-red-300'
                          : 'bg-green-500/20 text-green-300'
                      }`}>
                        {t.type === 'expense' ? 'Gasto' : 'Ingreso'}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-sm font-semibold whitespace-nowrap ${
                      t.type === 'expense' ? 'text-red-400' : 'text-green-400'
                    }`}>
                      {fmt(t.amount)}
                    </td>
                    <td className="px-4 py-3 flex gap-2 justify-end">
                      <button 
                        onClick={() => openEdit(t)}
                        className="px-2 py-1 text-sm opacity-60 hover:opacity-100 hover:bg-white/10 rounded transition-all"
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => setConfirmDelete(t.id)}
                        className="px-2 py-1 text-sm opacity-60 hover:opacity-100 hover:bg-red-500/20 rounded transition-all"
                        title="Eliminar"
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={closeModal}
        >
          <div 
            className="card w-full max-w-sm mx-4 animate-in fade-in zoom-in duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <h2 className="text-lg font-semibold text-white">
                {editing ? 'Editar transacción' : 'Nueva transacción'}
              </h2>
              <button 
                onClick={closeModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Type */}
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                  Tipo
                </label>
                <div className="flex gap-2">
                  <button
                    className={`flex-1 py-2 px-3 rounded-lg border transition-all text-sm font-medium ${
                      form.type === 'expense'
                        ? 'bg-red-500/20 text-red-300 border-red-500/30'
                        : 'bg-gray-800 text-gray-400 border-gray-700'
                    }`}
                    onClick={() => setForm(f => ({ ...f, type: 'expense' }))}
                  >
                    Gasto
                  </button>
                  <button
                    className={`flex-1 py-2 px-3 rounded-lg border transition-all text-sm font-medium ${
                      form.type === 'income'
                        ? 'bg-green-500/20 text-green-300 border-green-500/30'
                        : 'bg-gray-800 text-gray-400 border-gray-700'
                    }`}
                    onClick={() => setForm(f => ({ ...f, type: 'income' }))}
                  >
                    Ingreso
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                  Monto
                </label>
                <input
                  className="input"
                  type="number"
                  placeholder="0"
                  value={form.amount}
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                />
              </div>

              {/* Category */}
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                  Categoría
                </label>
                <select 
                  className="input"
                  value={form.category} 
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                >
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                  Descripción
                </label>
                <input
                  className="input"
                  type="text"
                  placeholder="Ej: Almuerzo en el centro"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>

              {/* Date */}
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                  Fecha
                </label>
                <input
                  className="input"
                  type="date"
                  value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-white/5">
              <button 
                onClick={closeModal}
                className="flex-1 btn-secondary"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSave}
                disabled={saving}
                className="flex-1 btn-primary"
              >
                {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Agregar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setConfirmDelete(null)}
        >
          <div 
            className="card w-full max-w-sm mx-4 animate-in fade-in zoom-in duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-white/5">
              <h2 className="text-lg font-semibold text-white">Eliminar transacción</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-400 text-sm">
                ¿Estás seguro? Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-white/5">
              <button 
                onClick={() => setConfirmDelete(null)}
                className="flex-1 btn-secondary"
              >
                Cancelar
              </button>
              <button 
                onClick={() => handleDelete(confirmDelete)}
                className="flex-1 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg font-medium transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
