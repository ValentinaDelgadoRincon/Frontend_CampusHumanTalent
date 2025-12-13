const data = JSON.parse(localStorage.getItem('data'));
let areasCache = {};
let cargosCache = {};
let usuarioActual = null;

function getUserIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

document.addEventListener('DOMContentLoaded', async () => {
    if (!data || !data.token) {
        window.location.href = '../../index.html';
        return;
    }

    await loadAreasAndCargos();
    await loadUserProfile();

    setupAdminButtons();
});

async function loadAreasAndCargos() {
    try {
        const [areas, cargos] = await Promise.all([
            Areas_TrabajoAPI.getAll(),
            CargosAPI.getAll()
        ]);

        areasCache = areas.reduce((acc, item) => ({ ...acc, [item._id]: item.nombre }), {});
        cargosCache = cargos.reduce((acc, item) => ({ ...acc, [item._id]: item.nombre }), {});
    } catch (error) {
        console.error("Error cargando catálogos:", error);
    }
}

async function loadUserProfile() {
    const userId = getUserIdFromURL();
    if (!userId) {
        alert("No se especificó un usuario.");
        window.location.href = './inicioUsuario.html';
        return;
    }

    try {
        usuarioActual = await UsuariosAPI.getById(userId);
        renderUserInfo(usuarioActual);
    } catch (error) {
        console.error("Error cargando usuario:", error);
        alert("Error al cargar el perfil del usuario.");
    }
}

function renderUserInfo(user) {
    document.querySelector('.user-name').textContent = `${user.nombre} ${user.apellido}`;
    document.querySelector('.user-desc').textContent = user.sobremi || 'Sin descripción profesional.';

    document.getElementById('userCargo').textContent = cargosCache[user.id_cargo] || 'No definido';
    document.getElementById('userArea').textContent = areasCache[user.id_area_trabajo] || 'No definida';

    const linkedinLink = document.querySelector('#liLinkedin a');
    const linkedInBase = 'https://www.linkedin.com/in/';
    if (user.linkedIn) {
        let username = user.linkedIn;
        try {
            const url = new URL(user.linkedIn);
            if (url.hostname && url.hostname.includes('linkedin.com')) {
                username = url.pathname.replace(/^\/+|\/+$/g, '');
            }
        } catch (e) {
            username = user.linkedIn;
        }

        const finalUrl = linkedInBase + username;
        linkedinLink.href = finalUrl;
        linkedinLink.textContent = "Perfil LinkedIn";
        linkedinLink.target = '_blank';
        linkedinLink.rel = 'noopener noreferrer';
    } else {
        linkedinLink.textContent = "No disponible";
        linkedinLink.removeAttribute('href');
    }

    const emailLink = document.querySelector('#liEmail a');
    emailLink.href = `mailto:${user.email}`;
    emailLink.textContent = user.email;

    const phoneLink = document.querySelector('#liPhone a');
    if (user.telefono) {
        phoneLink.href = `tel:${user.telefono}`;
        phoneLink.textContent = user.telefono;
    } else {
        phoneLink.textContent = "No registrado";
        phoneLink.removeAttribute('href');
    }

    const promedio = user.estadisticas_evaluacion?.promedio_general || 0;
    document.querySelector('.rating-number').textContent = parseFloat(promedio).toFixed(1);
    document.querySelector('.rating-number').style.color = '#eebb00';

    document.getElementById('ponderadoValue').textContent = parseFloat(promedio).toFixed(1);

    const btnCalificar = document.getElementById('btnCalificarUser');
    btnCalificar.href = `../../views/user/encuestaUsuario.html?id=${user._id}`;
}

async function setupAdminButtons() {
    try {
        const currentUser = data.usuario;
        if (!currentUser || !currentUser.id_rol) {
            hideAdminButtons();
            return;
        }

        const roleResp = await fetch(`http://localhost:3000/roles/${currentUser.id_rol}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${data.token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!roleResp.ok) {
            hideAdminButtons();
            return;
        }

        const role = await roleResp.json();
        const isAdmin = (role.nombre || '').toLowerCase().includes('administrador');

        if (!isAdmin) {
            hideAdminButtons();
            return;
        }

        showAdminButtons();
        configureAdminButtonListeners();
    } catch (error) {
        console.error('Error verificando rol de administrador:', error);
        hideAdminButtons();
    }
}

function hideAdminButtons() {
    const adminFooter = document.querySelector('.admin-footer');
    if (adminFooter) {
        adminFooter.style.display = 'none';
    }
}

function showAdminButtons() {
    const adminFooter = document.querySelector('.admin-footer');
    if (adminFooter) {
        adminFooter.style.display = 'flex';
    }
}

function configureAdminButtonListeners() {
    const btnDeshabilitar = document.getElementById('btnDeshabilitar');
    const btnHistorial = document.getElementById('btnHistorial');
    const btnVerCalificaciones = document.getElementById('btnVerCalificaciones');

    btnDeshabilitar.addEventListener('click', async () => {
        if (!usuarioActual) return;

        const confirmAction = confirm(`¿Estás seguro de que deseas deshabilitar a ${usuarioActual.nombre}?`);
        if (confirmAction) {
            try {
                const estadoInactivoId = '693cef998a9247fb779a70c2';

                const resp = await fetch(`http://localhost:3000/usuarios/admin/${usuarioActual._id}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${data.token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ id_estado: estadoInactivoId })
                });

                if (!resp.ok) {
                    let errMsg = `Error ${resp.status}`;
                    try {
                        const errBody = await resp.json();
                        errMsg = errBody.mensaje || errBody.message || errMsg;
                    } catch (e) { }
                    throw new Error(errMsg);
                }

                let result = null;
                try { result = await resp.json(); } catch (e) { }

                usuarioActual.id_estado = estadoInactivoId;
                const btnDeshabilitarEl = document.getElementById('btnDeshabilitar');
                if (btnDeshabilitarEl) {
                    btnDeshabilitarEl.disabled = true;
                    btnDeshabilitarEl.textContent = 'Deshabilitado';
                }

                alert('Usuario deshabilitado correctamente.');
            } catch (error) {
                console.error(error);
                alert('Error al deshabilitar usuario: ' + (error.message || error));
            }
        }
    });

    btnHistorial.addEventListener('click', () => {
        window.location.href = `../admin/historialCiclos.html?id=${usuarioActual._id}`;
    });

    btnVerCalificaciones.addEventListener('click', () => {
        window.location.href = `../admin/historialRespuestas.html?id=${usuarioActual._id}`;
    });
}