const url= 'http://localhost:3000';
export const getTransactions = async () => {
const userData = JSON.parse(localStorage.getItem('sb-cypvsvoaleucsdgaiins-auth-token') || '{}');
    try {
        const response = await fetch(`${url}/api/transactions`, {
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