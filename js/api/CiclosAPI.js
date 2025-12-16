class CiclosAPI {
    static async getAll() {
        const data = JSON.parse(localStorage.getItem('data'));
        try {
            const response = await fetch('http://localhost:3000/ciclos-evaluacion', {
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
            console.error('Error fetching ciclos-evaluacion:', error);
            throw error;
        }
    }

    static async getById(id) {
        const data = JSON.parse(localStorage.getItem('data'));
        try {
            const response = await fetch(`http://localhost:3000/ciclos-evaluacion/${id}`, {
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
            console.error('Error fetching ciclos-evaluacion by id:', error);
            throw error;
        }
    }

    static async getActivo() {
        const ciclos = await this.getAll();
        return ciclos.find(ciclo => ciclo.estado === 'Abierto') || ciclos[0];
    }
}
