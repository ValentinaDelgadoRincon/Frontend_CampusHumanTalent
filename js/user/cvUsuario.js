const data = JSON.parse(localStorage.getItem('data'));
let areasCache = {};
let cargosCache = {};
let estadosCache = {};
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
        const [areas, cargos, estados] = await Promise.all([
            Areas_TrabajoAPI.getAll(),
            CargosAPI.getAll(),
            fetch(`http://localhost:3000/estados`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${data.token}`,
                    'Content-Type': 'application/json'
                },
                credentials: "include"
            }).then(res => res.json())
        ]);

        areasCache = areas.reduce((acc, item) => ({ ...acc, [item._id]: item.nombre }), {});
        cargosCache = cargos.reduce((acc, item) => ({ ...acc, [item._id]: item.nombre }), {});
        estadosCache = (estados || []).reduce((acc, item) => {
            acc[item.nombre] = item._id;
            return acc;
        }, {});

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

    const imgElement = document.getElementById('userProfileImage');
    const iconElement = document.getElementById('defaultUserIcon');
    if (user.foto) {
        const imgSrc = user.foto.startsWith('http') ? user.foto : `http://localhost:3000/${user.foto}`;
        if (imgElement) {
            imgElement.src = imgSrc;
            imgElement.style.display = 'block';
        }
        if (iconElement) iconElement.style.display = 'none';
    } else {
        if (imgElement) imgElement.style.display = 'none';
        if (iconElement) iconElement.style.display = 'block';
    }

    const linkedinLink = document.querySelector('#liLinkedin a');
    const linkedInBase = 'https://www.linkedin.com/in/';
    if (user.linkedIn) {
        let username = user.linkedIn;
        try {
            const url = new URL(user.linkedIn);
            if (url.hostname.includes('linkedin.com')) {
                username = url.pathname.replace(/^\/+|\/+$/g, '');
            }
        } catch (e) { username = user.linkedIn; }

        linkedinLink.href = linkedInBase + username;
        linkedinLink.textContent = "Perfil LinkedIn";
        linkedinLink.target = '_blank';
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
        const act = parseFloat(user.estadisticas_evaluacion.promedio_actitud || 0);
        const apt = parseFloat(user.estadisticas_evaluacion.promedio_aptitud || 0);
        promedioGeneral = (act + apt) / 2;
    }

    const ratingNum = document.querySelector('.rating-number');
    if (ratingNum) {
        ratingNum.textContent = parseFloat(promedioGeneral).toFixed(1);
        ratingNum.style.color = '#eebb00';
    }

    const ponderadoVal = document.getElementById('ponderadoValue');
    if (ponderadoVal) ponderadoVal.textContent = parseFloat(promedioGeneral).toFixed(1);

    const btnCalificar = document.getElementById('btnCalificarUser');
    if (btnCalificar) btnCalificar.href = `../../views/user/encuestaUsuario.html?id=${user._id}`;
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
            },
            credentials: "include"
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

            const ratingBox = document.querySelector('.rating-box.admin-only');
            const ratingNum = document.querySelector('.rating-number');

            if (ratingBox) {
                if (ratingNum) ratingNum.style.display = 'none';
                ratingBox.style.display = 'flex';

                document.getElementById('ratingAptitud').textContent = parseFloat(apt).toFixed(1);
                document.getElementById('ratingActitud').textContent = parseFloat(act).toFixed(1);
            } else if (ratingNum) {
                ratingNum.innerHTML = `<span style="font-size:1.4rem; display:block">Act: ${parseFloat(act).toFixed(1)}</span><span style="font-size:1.4rem">Apt: ${parseFloat(apt).toFixed(1)}</span>`;
            }

            const ponderado = (parseFloat(act) + parseFloat(apt)) / 2 || 0;
            const ponderEl = document.getElementById('ponderadoValue');
            if (ponderEl) ponderEl.textContent = parseFloat(ponderado).toFixed(1);

        } catch (e) {
            console.error('Error mostrando ratings detallados:', e);
        }

    } catch (error) {
        console.error('Error verificando rol:', error);
        hideAdminButtons();
    }
}

function replaceCalificarWithEditar() {
    const btnCalificar = document.getElementById('btnCalificarUser');
    if (!btnCalificar) return;

    const newBtn = btnCalificar.cloneNode(true);
    newBtn.textContent = 'Editar';
    newBtn.removeAttribute('href');
    newBtn.style.cursor = 'pointer';
    newBtn.id = 'btnEditarAdmin';

    newBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openAdminEditModal();
    });

    btnCalificar.parentNode.replaceChild(newBtn, btnCalificar);
}

function hideAdminButtons() {
    const adminFooter = document.querySelector('.admin-footer');
    if (adminFooter) adminFooter.style.display = 'none';
}

function showAdminButtons() {
    const adminFooter = document.querySelector('.admin-footer');
    if (adminFooter) adminFooter.style.display = 'flex';
}

function configureAdminButtonListeners() {
    const btnDeshabilitar = document.getElementById('btnDeshabilitar');
    const btnHistorial = document.getElementById('btnHistorial');
    const btnVerCalificaciones = document.getElementById('btnVerCalificaciones');

    const extractId = (ref) => {
        if (!ref) return null;
        if (typeof ref === 'string') return ref;
        if (ref.$oid) return ref.$oid;
        if (ref._id) return (typeof ref._id === 'string') ? ref._id : (ref._id.$oid || null);
        return null;
    };

    const ESTADO_ACTIVO = estadosCache['Activo'] || '693cef998a9247fb779a70c1';
    const ESTADO_INACTIVO = estadosCache['Inactivo'] || '693cef998a9247fb779a70c2';

    const updateToggleButton = () => {
        if (!btnDeshabilitar) return;
        const estadoId = extractId(usuarioActual?.id_estado) || '';

        if (estadoId === ESTADO_INACTIVO) {
            btnDeshabilitar.textContent = 'Habilitar';
            btnDeshabilitar.style.backgroundColor = '#28a745';
            btnDeshabilitar.style.color = 'white';
            btnDeshabilitar.style.border = 'none';
        } else {
            btnDeshabilitar.textContent = 'Deshabilitar';
            btnDeshabilitar.style.backgroundColor = '';
            btnDeshabilitar.style.color = '';
            btnDeshabilitar.style.border = '';
        }
    };

    updateToggleButton();

    if (btnDeshabilitar) {
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
                    credentials: "include",
                    body: JSON.stringify({ id_estado: targetEstado })
                });

                if (!resp.ok) throw new Error('Error al cambiar estado');

                usuarioActual.id_estado = targetEstado;
                updateToggleButton();
                alert(`Usuario ${isCurrentlyInactive ? 'habilitado' : 'deshabilitado'} correctamente.`);
            } catch (error) {
                console.error(error);
                alert('Error al cambiar el estado del usuario');
            }
        });
    }

    const closeModalBtn = document.getElementById('closeModal');
    if (closeModalBtn) closeModalBtn.addEventListener('click', () => closeAdminEditModal());

    const cancelBtn = document.getElementById('cancelBtn');
    if (cancelBtn) cancelBtn.addEventListener('click', () => closeAdminEditModal());

    const editForm = document.getElementById('editForm');
    if (editForm) editForm.addEventListener('submit', saveAdminEditForm);

    if (btnHistorial) {
        btnHistorial.addEventListener('click', () => {
            window.location.href = `../admin/historialCiclos.html?id=${usuarioActual._id}`;
        });
    }

    if (btnVerCalificaciones) {
        btnVerCalificaciones.addEventListener('click', () => {
            window.location.href = `../admin/historialRespuestas.html?id=${usuarioActual._id}`;
        });
    }

    const fotoInput = document.getElementById('foto');
    if (fotoInput) {
        fotoInput.addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (evt) {
                    const preview = document.getElementById('previewFoto');
                    const icon = document.getElementById('iconCamera');
                    if (preview) {
                        preview.src = evt.target.result;
                        preview.style.display = 'block';
                    }
                    if (icon) icon.style.display = 'none';
                }
                reader.readAsDataURL(file);
            }
        });
    }
}

function populateSelectCargo() {
    const select = document.getElementById('id_cargo');
    if (!select) return Promise.resolve();
    
    select.innerHTML = '<option value="">Seleccione un cargo</option>';
    
    return CargosAPI.getAll().then(cargos => {
        cargos.forEach(cargo => {
            const option = document.createElement('option');
            option.value = cargo._id;
            option.textContent = cargo.nombre;
            select.appendChild(option);
        });
    }).catch(error => {
        console.error('Error cargando cargos:', error);
    });
}

function populateSelectArea() {
    const select = document.getElementById('id_area_trabajo');
    if (!select) return Promise.resolve();
    
    select.innerHTML = '<option value="">Seleccione un área</option>';
    
    return Areas_TrabajoAPI.getAll().then(areas => {
        areas.forEach(area => {
            const option = document.createElement('option');
            option.value = area._id;
            option.textContent = area.nombre;
            select.appendChild(option);
        });
    }).catch(error => {
        console.error('Error cargando áreas:', error);
    });
}

async function openAdminEditModal() {
    const modal = document.getElementById('editModal');
    if (!modal || !usuarioActual) return;

    const inputs = {
        'nombre': usuarioActual.nombre,
        'apellido': usuarioActual.apellido,
        'email': usuarioActual.email,
        'telefono': usuarioActual.telefono,
        'linkedIn': usuarioActual.linkedIn,
        'sobreMi': usuarioActual.sobremi
    };

    for (const [id, val] of Object.entries(inputs)) {
        const el = document.getElementById(id);
        if (el) el.value = val || '';
    }

    await Promise.all([
        populateSelectCargo(),
        populateSelectArea()
    ]);

    if (usuarioActual.id_cargo) {
        const cargoSelect = document.getElementById('id_cargo');
        if (cargoSelect) cargoSelect.value = usuarioActual.id_cargo;
    }

    if (usuarioActual.id_area_trabajo) {
        const areaSelect = document.getElementById('id_area_trabajo');
        if (areaSelect) areaSelect.value = usuarioActual.id_area_trabajo;
    }

    const preview = document.getElementById('previewFoto');
    const icon = document.getElementById('iconCamera');
    if (usuarioActual.foto) {
        const src = usuarioActual.foto.startsWith('http') ? usuarioActual.foto : `http://localhost:3000/${usuarioActual.foto}`;
        if (preview) {
            preview.src = src;
            preview.style.display = 'block';
        }
        if (icon) icon.style.display = 'none';
    } else {
        if (preview) preview.style.display = 'none';
        if (icon) icon.style.display = 'block';
    }

    modal.classList.add('show');
}

function closeAdminEditModal() {
    const modal = document.getElementById('editModal');
    if (modal) modal.classList.remove('show');
}

async function saveAdminEditForm(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (!usuarioActual) return;

    const form = document.getElementById('editForm');
    const formData = new FormData(form);

    const dataObj = Object.fromEntries(formData.entries());
    
    delete dataObj.foto;

    try {
        const resp = await fetch(`http://localhost:3000/usuarios/admin/${usuarioActual._id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${data.token}`,
                'Content-Type': 'application/json'
            },
            credentials: "include",
            body: JSON.stringify(dataObj)
        });

        if (!resp.ok) {
            const err = await resp.json();
            throw new Error(err.mensaje || err.message || 'Error al actualizar');
        }

        const updatedData = await resp.json();
        usuarioActual = { ...usuarioActual, ...updatedData };

        renderUserInfo(usuarioActual);
        closeAdminEditModal();
        alert('Información actualizada correctamente.');

    } catch (error) {
        console.error('Error al guardar datos:', error);
        alert('Error al guardar los datos: ' + error.message);
    }
}
