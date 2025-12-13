const UsuariosAPI = {
    baseURL: 'http://localhost:3000/usuarios',

    async getAll() {
        try {
            const data = JSON.parse(localStorage.getItem('data'));
            const response = await fetch(this.baseURL, {
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
            console.error('Error al obtener usuarios:', error);
            throw error;
        }
    },

    async getById(id) {
        try {
            const data = JSON.parse(localStorage.getItem('data'));
            const response = await fetch(`${this.baseURL}/${id}`, {
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
            console.error('Error al obtener usuario:', error);
            throw error;
        }
    }
};
