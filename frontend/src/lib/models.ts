export interface Transaction {
  id?: string
  type: 'expense' | 'income'
  amount: number
  category: string
  description: string
  date: string
}
export interface Filters{
    from?: string
    to?: string
    type?: string
    category?: string
}