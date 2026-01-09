async function handleLogout() {
    try {
        const data = JSON.parse(localStorage.getItem('data'));
        if (!data || !data.token) {
            localStorage.clear();
            window.location.href = '../../index.html';
            return;
        }

        const response = await fetch('http://localhost:3000/usuarios/logout', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${data.token}`,
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({})
        });

        const responseData = await response.json();

        if (!response.ok) {
            if (!responseData.exito && responseData.data) {
                const { ciclo, totalObligatorias, realizadas, faltantes } = responseData.data;
                
                let mensaje = `No puedes cerrar sesión hasta completar todas las evaluaciones obligatorias.\n\n`;
                mensaje += `Ciclo Activo: ${ciclo.nombre}\n`;
                mensaje += `Evaluaciones completadas: ${realizadas}/${totalObligatorias}\n`;
                mensaje += `Faltan ${faltantes.length} usuarios:\n\n`;
                
                faltantes.forEach((user, index) => {
                    mensaje += `${index + 1}. ${user.nombre} ${user.apellido} (${user.email})\n`;
                });

                alert(mensaje);
                return;
            } else {
                alert(responseData.mensaje || 'Error al intentar cerrar sesión');
                return;
            }
        }

        localStorage.clear();
        window.location.href = '../../index.html';

    } catch (error) {
        console.error('Error en logout:', error);
        if (confirm('No se pudo validar el logout en el servidor. ¿Cerrar sesión localmente?')) {
            localStorage.clear();
            window.location.href = '../../index.html';
        }
    }
}

async function checkIfAdmin(data) {
    try {
        const roleId = data.usuario.id_rol;
        const roleResponse = await fetch(`http://localhost:3000/roles/${roleId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${data.token}`,
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        if (roleResponse.ok) {
            const roleData = await roleResponse.json();
            const nombreRol = (roleData.nombre || '').toLowerCase();
            return nombreRol.includes('administrador');
        }
        
        return false;
    } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
    }
}
