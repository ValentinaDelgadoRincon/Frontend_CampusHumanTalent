class TipoEncuestasAPI {
    static async getAll() {
        const data = JSON.parse(localStorage.getItem('data'));
        try {
            const response = await fetch('http://localhost:3000/tipo-encuestas', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${data.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching tipo-encuestas:', error);
            throw error;
        }
    }

    static async getById(id) {
        const data = JSON.parse(localStorage.getItem('data'));
        try {
            const response = await fetch(`http://localhost:3000/tipo-encuestas/${id}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${data.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching tipo-encuestas by id:', error);
            throw error;
        }
    }
}
