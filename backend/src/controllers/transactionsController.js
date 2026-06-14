import {insertTransaction, getTransactions} from '../services/transactionService.js';

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
        const { from, to, type } = req.query;
        const transactions = await getTransactions(userId, { from, to, type });
        res.json({ transactions });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Error al obtener las transacciones' });
    }
}