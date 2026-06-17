import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Router from './router.tsx'
import './index.css'
import { Toaster } from 'sonner'
import { TransactionProvider } from './context/TransactionContext.tsx'
import type { Filters } from './lib/models.ts'

// Helper para formatear fechas en formato YYYY-MM-DD (el estándar para inputs tipo date)
const formatDate = (date: Date) => date.toISOString().split('T')[0];

const today = new Date();
// Primer día del mes actual (ej: 2026-06-01)
const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

// Definimos los filtros por defecto por rango de fecha
const defaultFilters: Filters = {
    from: formatDate(firstDayOfMonth), // Fecha de inicio
    to: formatDate(today)              // Fecha de fin (hoy)
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TransactionProvider initialFilters={defaultFilters}>
      <Router />
      <Toaster position="top-right" richColors />
    </TransactionProvider>
  </StrictMode>,
)
