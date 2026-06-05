import { supabase } from '../config/supabase.js'

export async function insertTransaction(transaction, userId) {
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      type: transaction.type,
      amount: transaction.amount,
      category: transaction.category,
      description: transaction.description,
      date: transaction.date
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getTransactions(userId, { from, to, type } = {}) {
  let query = supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })

  if (from) query = query.gte('date', from)
  if (to)   query = query.lte('date', to)
  if (type) query = query.eq('type', type)

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function deleteTransaction(id, userId) {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) throw error
}