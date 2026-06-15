import {insertTransaction, getTransactions, updateTransaction, deleteTransaction} from '../services/transactionService.js';

export async function insertData(req, res) {
    try {
        const userId = req.user.id;
        const transaction = req.body;
        const data = await insertTransaction(transaction, userId);
        res.json({ data });
    } catch (error) {
        console.error('Error inserting transaction:', error);
        res.status(500).json({ error: 'Error al insertar la transacción' });
    }
}
export async function getData(req, res) {
    try {
        const userId = req.user.id;
        console.log('Fetching transactions for user:', userId);
        const { from, to, type, category } = req.query;
        console.log('Query parameters:', { from, to, type, category });
        const transactions = await getTransactions(userId, { from, to, type, category });
        res.json({ transactions });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Error al obtener las transacciones' });
    }
}
export async function updateData(req, res) {
    try {
        const userId = req.user.id;
        const { id, ...transaction } = req.body;
        await updateTransaction(id, transaction, userId);
        res.json({ message: 'Transacción actualizada' });
    } catch (error) {
        console.error('Error updating transaction:', error);
        res.status(500).json({ error: 'Error al actualizar la transacción' });
    }
}

export async function deleteData(req, res) {
    try {
        const userId = req.user.id;
        const { id } = req.body;
        await deleteTransaction(id, userId);
        res.json({ message: 'Transacción eliminada' });
    } catch (error) {
        console.error('Error deleting transaction:', error);
        res.status(500).json({ error: 'Error al eliminar la transacción' });
    }
}