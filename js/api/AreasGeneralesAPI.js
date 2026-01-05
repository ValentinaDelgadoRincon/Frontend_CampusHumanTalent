class AreasGeneralesAPI {
    static async getAll() {
        const data = JSON.parse(localStorage.getItem('data'));
        if (!data?.token) throw new Error('No hay token de autenticación');

        const response = await fetch('http://localhost:3000/areas-generales', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${data.token}`,
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        if (!response.ok) throw new Error('Error al obtener áreas generales');
        return response.json();
    }

    static async getById(id) {
        const data = JSON.parse(localStorage.getItem('data'));
        if (!data?.token) throw new Error('No hay token de autenticación');

        const response = await fetch(`http://localhost:3000/areas-generales/${id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${data.token}`,
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        if (!response.ok) throw new Error('Error al obtener área general');
        return response.json();
    }

    static async getWithSubAreas(id) {
        const data = JSON.parse(localStorage.getItem('data'));
        if (!data?.token) throw new Error('No hay token de autenticación');

        const response = await fetch(`http://localhost:3000/areas-generales/${id}/con-subareas`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${data.token}`,
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        if (!response.ok) throw new Error('Error al obtener área general con sub-áreas');
        return response.json();
    }
}
