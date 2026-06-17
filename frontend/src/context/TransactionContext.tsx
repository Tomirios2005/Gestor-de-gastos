import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Transaction, Filters } from '../lib/models';
import { 
  getTransactions, 
  insertTransaction, 
  updateTransaction, 
  deleteTransaction as deleteTransactionService 
} from '../services/transactions'

// 1. Interfaz de todo lo que expondrá nuestro contexto
interface TransactionContextType {
  transactions: Transaction[];
  filters: Filters;
  isLoading: boolean;
  error: string | null;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  fetchTransactions: () => Promise<void>;
  addTransaction: (transaction: Transaction) => Promise<void>;
  editTransaction: (transaction: Transaction) => Promise<void>;
  removeTransaction: (id: string) => Promise<void>;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

interface ProviderProps {
  children: ReactNode;
  initialFilters: Filters; // Filtros iniciales por defecto (ej: fechas vacías o string vacío)
}

export const TransactionProvider: React.FC<ProviderProps> = ({ children, initialFilters }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 2. Traer transacciones usando el servicio de tu API
  const fetchTransactions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getTransactions(filters);
      setTransactions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al obtener transacciones');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Escuchar cambios en los filtros para refrescar los datos automáticamente
  useEffect(() => {
    fetchTransactions();
  }, [filters]); // Cada vez que cambie un filtro (fecha, tipo, etc.), se vuelve a disparar la petición

  // 4. Agregar una nueva transacción
  const addTransaction = async (transaction: Transaction) => {
    setIsLoading(true);
    try {
      const inserted = await insertTransaction(transaction);
      console.log(inserted+"esto retorna al insertar");
      // Actualizamos el estado local agregando la nueva transacción al principio
      setTransactions((prev) => [inserted, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al insertar transacción');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Editar una transacción existente
  const editTransaction = async (transaction: Transaction) => {
    setIsLoading(true);
    try {
      const updated = await updateTransaction(transaction);
      // Buscamos y reemplazamos el item editado en el estado local
      setTransactions((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar transacción');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // 6. Eliminar una transacción por ID
  const removeTransaction = async (id: string) => {
    setIsLoading(true);
    try {
      await deleteTransactionService(id);
      // Filtramos el estado local para quitar la transacción eliminada de la pantalla al instante
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar transacción');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        filters,
        isLoading,
        error,
        setFilters,
        fetchTransactions,
        addTransaction,
        editTransaction,
        removeTransaction,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

// 7. Hook personalizado para consumir el contexto de forma segura y tipada
export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactions debe usarse dentro de un TransactionProvider');
  }
  return context;
};
