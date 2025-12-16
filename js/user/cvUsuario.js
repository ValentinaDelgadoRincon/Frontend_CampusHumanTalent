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

    let promedioGeneral = user.estadisticas_evaluacion?.promedio_general || 0;
    if (promedioGeneral === 0 && user.estadisticas_evaluacion) {
        const act = user.estadisticas_evaluacion.promedio_actitud || 0;
        const apt = user.estadisticas_evaluacion.promedio_aptitud || 0;
        promedioGeneral = (parseFloat(act) + parseFloat(apt)) / 2;
    }
    document.querySelector('.rating-number').textContent = parseFloat(promedioGeneral).toFixed(1);
    document.querySelector('.rating-number').style.color = '#eebb00';
    document.getElementById('ponderadoValue').textContent = parseFloat(promedioGeneral).toFixed(1);

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
            replaceCalificarWithEditar();

            try {
                const act = usuarioActual.estadisticas_evaluacion?.promedio_actitud || 0;
                const apt = usuarioActual.estadisticas_evaluacion?.promedio_aptitud || 0;
                const ratingEl = document.querySelector('.rating-number');
                if (ratingEl) ratingEl.textContent = `Act: ${parseFloat(act).toFixed(1)} Apt: ${parseFloat(apt).toFixed(1)}`;
                const ponderado = (parseFloat(act) + parseFloat(apt)) / 2 || 0;
                const ponderEl = document.getElementById('ponderadoValue');
                if (ponderEl) ponderEl.textContent = parseFloat(ponderado).toFixed(1);
            } catch (e) {
                console.error('Error mostrando ratings detallados para admin:', e);
            }
    } catch (error) {
        console.error('Error verificando rol de administrador:', error);
        hideAdminButtons();
    }
}

function replaceCalificarWithEditar() {
    const btnCalificar = document.getElementById('btnCalificarUser');
    if (!btnCalificar) return;

    btnCalificar.textContent = 'Editar';
    btnCalificar.removeAttribute('href');
    btnCalificar.style.cursor = 'pointer';

    const newBtn = btnCalificar.cloneNode(true);
    newBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openAdminEditModal();
    });
    btnCalificar.parentNode.replaceChild(newBtn, btnCalificar);
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
    const btnEditarInfo = document.getElementById('btnEditarInfo');

    const extractId = (ref) => {
        if (!ref) return null;
        if (typeof ref === 'string') return ref;
        if (ref.$oid) return ref.$oid;
        if (ref._id) return (typeof ref._id === 'string') ? ref._id : (ref._id.$oid || null);
        return null;
    };

    const ESTADO_ACTIVO = '693cef998a9247fb779a70c1';
    const ESTADO_INACTIVO = '693cef998a9247fb779a70c2';

    const updateToggleButton = () => {
        if (!btnDeshabilitar) return;
        const estadoId = extractId(usuarioActual?.id_estado) || '';
        if (estadoId === ESTADO_INACTIVO) {
            btnDeshabilitar.textContent = 'Habilitar';
            btnDeshabilitar.disabled = false;
        } else {
            btnDeshabilitar.textContent = 'Deshabilitar';
            btnDeshabilitar.disabled = false;
        }
    };

    updateToggleButton();

    btnDeshabilitar.addEventListener('click', async () => {
        if (!usuarioActual) return;

        const estadoId = extractId(usuarioActual.id_estado);
        const isCurrentlyInactive = (estadoId === ESTADO_INACTIVO);
        const targetEstado = isCurrentlyInactive ? ESTADO_ACTIVO : ESTADO_INACTIVO;
        const actionText = isCurrentlyInactive ? 'habilitar' : 'deshabilitar';

        const confirmAction = confirm(`¿Estás seguro de que deseas ${actionText} a ${usuarioActual.nombre}?`);
        if (!confirmAction) return;

        try {
            const resp = await fetch(`http://localhost:3000/usuarios/admin/${usuarioActual._id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${data.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id_estado: targetEstado })
            });

            if (!resp.ok) {
                let errMsg = `Error ${resp.status}`;
                try {
                    const errBody = await resp.json();
                    errMsg = errBody.mensaje || errBody.message || errMsg;
                } catch (e) { }
                throw new Error(errMsg);
            }

            try { await resp.json(); } catch (e) { }

            usuarioActual.id_estado = targetEstado;
            updateToggleButton();

            alert(`Usuario ${isCurrentlyInactive ? 'habilitado' : 'deshabilitado'} correctamente.`);
        } catch (error) {
            console.error(error);
            alert('Error al cambiar el estado del usuario: ' + (error.message || error));
        }
    });


    if (btnEditarInfo) {
        btnEditarInfo.addEventListener('click', () => openAdminEditModal());
    }

    const closeModalBtn = document.getElementById('closeModal');
    if (closeModalBtn) closeModalBtn.addEventListener('click', () => closeAdminEditModal());

    const cancelBtn = document.getElementById('cancelBtn');
    if (cancelBtn) cancelBtn.addEventListener('click', () => closeAdminEditModal());

    const editForm = document.getElementById('editForm');
    if (editForm) editForm.addEventListener('submit', saveAdminEditForm);

    btnHistorial.addEventListener('click', () => {
        window.location.href = `../admin/historialCiclos.html?id=${usuarioActual._id}`;
    });

    btnVerCalificaciones.addEventListener('click', () => {
        window.location.href = `../admin/historialRespuestas.html?id=${usuarioActual._id}`;
    });
}

function openAdminEditModal() {
    const modal = document.getElementById('editModal');
    if (!modal || !usuarioActual) return;
    const sobreMiInput = document.getElementById('sobreMi');
    const linkedInInput = document.getElementById('linkedIn');
    const emailInput = document.getElementById('email');
    const telefonoInput = document.getElementById('telefono');
    const nombreInput = document.getElementById('nombre');
    const apellidoInput = document.getElementById('apellido');

    if (sobreMiInput) sobreMiInput.value = usuarioActual.sobremi || '';
    if (linkedInInput) linkedInInput.value = usuarioActual.linkedIn || '';
    if (emailInput) emailInput.value = usuarioActual.email || '';
    if (telefonoInput) telefonoInput.value = usuarioActual.telefono || '';
    if (nombreInput) nombreInput.value = usuarioActual.nombre || '';
    if (apellidoInput) apellidoInput.value = usuarioActual.apellido || '';

    modal.classList.add('show');
}

function closeAdminEditModal() {
    const modal = document.getElementById('editModal');
    if (modal) modal.classList.remove('show');
}

async function saveAdminEditForm(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (!usuarioActual) return;

    const sobreMiInput = document.getElementById('sobreMi');
    const linkedInInput = document.getElementById('linkedIn');
    const telefonoInput = document.getElementById('telefono');
    const nombreInput = document.getElementById('nombre');
    const apellidoInput = document.getElementById('apellido');
    const emailInput = document.getElementById('email');

    const updateData = {
        nombre: nombreInput ? nombreInput.value : '',
        apellido: apellidoInput ? apellidoInput.value : '',
        email: emailInput ? emailInput.value : '',
        sobremi: sobreMiInput ? sobreMiInput.value : '',
        linkedIn: linkedInInput ? linkedInInput.value : '',
        telefono: telefonoInput ? telefonoInput.value : ''
    };

    try {
        const resp = await fetch(`http://localhost:3000/usuarios/admin/${usuarioActual._id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${data.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });

        if (!resp.ok) {
            let errMsg = `Error ${resp.status}`;
            try {
                const errBody = await resp.json();
                errMsg = errBody.mensaje || errBody.message || errMsg;
            } catch (e) { }
            throw new Error(errMsg);
        }

        try { await resp.json(); } catch (e) { }

        usuarioActual = { ...usuarioActual, ...updateData };
        renderUserInfo(usuarioActual);
        closeAdminEditModal();
        alert('Información actualizada correctamente.');
    } catch (error) {
        console.error('Error al guardar datos:', error);
        alert('Error al guardar los datos: ' + (error.message || error));
    }
}