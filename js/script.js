const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('emailInput');
const passwordInput = document.getElementById('passwordInput');
const btnLogin = document.getElementById('btnLogin');
const msgError = document.getElementById('mensaje-error');

function validateExistingSession() {
    const storedData = localStorage.getItem('data');
    if (storedData) {
        try {
            const data = JSON.parse(storedData);
            if (data.usuario && data.usuario.id_rol && data.token) {
                (async () => {
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
                            if (nombreRol.includes('administrador')) {
                                window.location.href = './views/admin/inicioAdmin.html';
                            } else {
                                window.location.href = './views/user/inicioUsuario.html';
                            }
                        } else {
                            window.location.href = './views/user/inicioUsuario.html';
                        }
                    } catch (error) {
                        console.error('Error validating session:', error);
                        window.location.href = './views/user/inicioUsuario.html';
                    }
                })();
            }
        } catch (error) {
            console.error('Error parsing stored session:', error);
        }
    }
}

validateExistingSession();

function mostrarError(mensaje) {
    msgError.innerText = mensaje;
    msgError.style.display = 'block';

    loginForm.classList.add('shake');
    setTimeout(() => loginForm.classList.remove('shake'), 500);
}

if (loginForm && emailInput && passwordInput && btnLogin && msgError) {

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        msgError.style.display = 'none';
        msgError.innerText = '';

        const datosUsuario = {
            email: emailInput.value,
            password: passwordInput.value
        };

        const textoOriginal = btnLogin.innerText;
        btnLogin.innerText = 'Validando...';
        btnLogin.disabled = true;
        btnLogin.style.opacity = '0.7';

        try {
            const api = 'http://localhost:3000/usuarios/login';

            const response = await fetch(api, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: "include",
                body: JSON.stringify(datosUsuario)
            });

            const data = await response.json();

            const extractId = (ref) => {
                if (!ref) return null;
                if (typeof ref === 'string') return ref;
                if (ref.$oid) return ref.$oid;
                if (ref['$oid']) return ref['$oid'];
                if (ref._id) return (typeof ref._id === 'string') ? ref._id : (ref._id.$oid || null);
                return null;
            };

            if (response.ok) {
                const usuario = data.usuario || {};
                const estadoId = extractId(usuario.id_estado) || extractId(usuario.idEstado) || null;

                try {
                    const statesResponse = await fetch('http://localhost:3000/estados', {
                        method: 'GET',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include'
                    });

                    if (statesResponse.ok) {
                        const estados = await statesResponse.json();
                        const inactivoEstado = estados.find(e => e.nombre && e.nombre.toLowerCase().includes('inactivo'));
                        const inactivoId = inactivoEstado ? extractId(inactivoEstado) : null;

                        if (inactivoId && estadoId === inactivoId) {
                            mostrarError('Este usuario se encuentra inhabilitado');
                            return;
                        }
                    }
                } catch (error) {
                    console.error('Error fetching estados:', error);
                }

                localStorage.setItem('data', JSON.stringify(data));
                console.log(data);

                try {
                    const roleId = data.usuario.id_rol;
                    const roleResponse = await fetch(`http://localhost:3000/roles/${roleId}`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${data.token}`,
                            'Content-Type': 'application/json'
                        },
                        credentials: "include"
                    });

                    if (roleResponse.ok) {
                        const roleData = await roleResponse.json();
                        const nombreRol = (roleData.nombre || '').toLowerCase();
                        console.log('Rol:', nombreRol);

                        if (nombreRol.includes('administrador')) {
                            window.location.href = './views/admin/inicioAdmin.html';
                        } else {
                            window.location.href = './views/user/inicioUsuario.html';
                        }
                    } else {
                        window.location.href = './views/inicioUsuario.html';
                    }
                } catch (error) {
                    console.error('Error al obtener el rol:', error);
                    window.location.href = './views/inicioUsuario.html';
                }
            } else {
                mostrarError(data.message || 'Usuario o contraseña incorrectos');
            }

        } catch (error) {
            console.error("Error inesperado:", error);
            mostrarError('Ocurrió un error inesperado.');
        } finally {
            btnLogin.innerText = textoOriginal;
            btnLogin.disabled = false;
            btnLogin.style.opacity = '1';
        }
    });

} else {
    console.error("Error: Algunos elementos necesarios para el login no se encontraron en el DOM.");
}
