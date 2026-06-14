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
export const insertTransaction = async (transaction: { type: string; amount: number; category: string; description: string; date: string }) => {
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