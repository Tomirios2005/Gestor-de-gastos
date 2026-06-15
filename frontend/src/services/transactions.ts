import type {Transaction} from '../pages/Transactions';
const url= 'http://localhost:3000'; // Change this to your backend URL if different
interface filters{
    from?: string
    to?: string
    type?: string
    category?: string
}
export const getTransactions = async (filters:filters) => {
const userData = JSON.parse(localStorage.getItem('sb-cypvsvoaleucsdgaiins-auth-token') || '{}');
    try {
                    console.log('Fetching transactions with filters:', filters); // Debugging line to check the filters being sent

        const response = await fetch(`${url}/api/transactions?${new URLSearchParams(filters as Record<string,string>)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userData.access_token}`
            },
            
        });
        if (!response.ok) {
            throw new Error('Error fetching transactions');
        }
        const data = await response.json();
        console.log('Fetched transactions:', data); // Debugging line to check the fetched data
        return data.transactions;
    } catch (error) {
        console.error('Error fetching transactions:', error);
        throw error;
    }
};
export const insertTransaction = async (transaction:Transaction) => {
    const userData = JSON.parse(localStorage.getItem('sb-cypvsvoaleucsdgaiins-auth-token') || '{}');
    try {
        const response = await fetch(`${url}/api/transactions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userData.access_token}`
            },
            body: JSON.stringify(transaction)
        });
        if (!response.ok) {
            throw new Error('Error inserting transaction');
        }
        const data = await response.json();
        console.log('Inserted transaction:', data); // Debugging line to check the inserted transaction response
        return data.transaction;
    } catch (error) {
        console.error('Error inserting transaction:', error);
        throw error;
    }
};
export const updateTransaction = async (transaction:Transaction) => {
    const userData = JSON.parse(localStorage.getItem('sb-cypvsvoaleucsdgaiins-auth-token') || '{}');
    try {
        const response = await fetch(`${url}/api/transactions`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userData.access_token}`
            },
            body: JSON.stringify(transaction)
        });
        if (!response.ok) {
            throw new Error('Error updating transaction');
        }
        const data = await response.json();
        console.log('Updated transaction:', data); // Debugging line to check the updated transaction response
        return data.transaction;
    } catch (error) {
        console.error('Error updating transaction:', error);
        throw error;
    }
};
export const deleteTransaction = async (id:string) => {
    const userData = JSON.parse(localStorage.getItem('sb-cypvsvoaleucsdgaiins-auth-token') || '{}');
    try {
        const response = await fetch(`${url}/api/transactions`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userData.access_token}`
            },
            body: JSON.stringify({id})
        });
        if (!response.ok) {
            throw new Error('Error deleting transaction');
        }
        const data = await response.json();
        console.log('Deleted transaction:', data); // Debugging line to check the deleted transaction response
        return data.message;
    } catch (error) {
        console.error('Error deleting transaction:', error);
        throw error;
    }
};