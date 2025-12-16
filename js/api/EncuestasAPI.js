class EncuestasAPI {
    static async getAll() {
        const data = JSON.parse(localStorage.getItem('data'));
        try {
            const response = await fetch('http://localhost:3000/encuestas', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${data.token}`,
                    'Content-Type': 'application/json'
                },
                credentials: "include"
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching encuestas:', error);
            throw error;
        }
    }

    static async getById(id) {
        const data = JSON.parse(localStorage.getItem('data'));
        try {
            const response = await fetch(`http://localhost:3000/encuestas/${id}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${data.token}`,
                    'Content-Type': 'application/json'
                },
                credentials: "include"
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching encuestas by id:', error);
            throw error;
        }
    }
}
