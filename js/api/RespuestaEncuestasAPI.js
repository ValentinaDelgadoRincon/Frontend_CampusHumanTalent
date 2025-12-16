class RespuestaEncuestasAPI {
    static async getAll() {
        const data = JSON.parse(localStorage.getItem('data'));
        try {
            const response = await fetch('http://localhost:3000/respuesta-encuestas', {
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
            console.error('Error fetching respuesta-encuestas:', error);
            throw error;
        }
    }

    static async getById(id) {
        const data = JSON.parse(localStorage.getItem('data'));
        try {
            const response = await fetch(`http://localhost:3000/respuesta-encuestas/${id}`, {
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
            console.error('Error fetching respuesta-encuestas by id:', error);
            throw error;
        }
    }

    static async create(respuestaData) {
        const data = JSON.parse(localStorage.getItem('data'));
        try {
            const response = await fetch('http://localhost:3000/respuesta-encuestas', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${data.token}`,
                    'Content-Type': 'application/json'
                },
                credentials: "include",
                body: JSON.stringify(respuestaData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = errorData.mensaje || response.statusText;
                throw new Error(`Error ${response.status}: ${errorMessage}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating respuesta-encuesta:', error);
            throw error;
        }
    }

    static async getByCicloId(cicloId) {
        const data = JSON.parse(localStorage.getItem('data'));
        try {
            const response = await fetch(`http://localhost:3000/respuesta-encuestas/ciclo/${cicloId}`, {
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
            console.error('Error fetching respuesta-encuestas by ciclo:', error);
            throw error;
        }
    }

    static async getByEvaluadoId(evaluadoId) {
        const data = JSON.parse(localStorage.getItem('data'));
        try {
            const response = await fetch(`http://localhost:3000/respuesta-encuestas/evaluado/${evaluadoId}`, {
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
            console.error('Error fetching respuesta-encuestas by evaluado:', error);
            throw error;
        }
    }
}
