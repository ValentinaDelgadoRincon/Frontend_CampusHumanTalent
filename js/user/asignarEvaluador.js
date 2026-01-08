const data = JSON.parse(localStorage.getItem('data'));
const urlParams = new URLSearchParams(window.location.search);
const areaGeneralId = urlParams.get('areaGeneralId');
const targetUserId = urlParams.get('userId');
const currentLeaderId = data?.usuario?._id;

let assignedUsersList;
let availableUsersList;
let searchAvailable;
let btnGuardar;

let allUsers = [];
let areasById = {};
let assignedIds = [];
let allAreaUsers = [];
let originalAssignedIds = [];
let pendingChanges = { toAdd: [], toRemove: [] };

async function init() {
    assignedUsersList = document.getElementById('assignedUsersList');
    availableUsersList = document.getElementById('availableUsersList');
    searchAvailable = document.getElementById('searchAvailable');
    btnGuardar = document.getElementById('btnGuardar');

    if (!data || !data.token || !areaGeneralId || !currentLeaderId) {
        console.error('Datos requeridos faltantes:', { data: !!data, token: !!data?.token, areaGeneralId, currentLeaderId });
        assignedUsersList.innerHTML = '<p>Error: Faltan datos requeridos. Por favor, vuelve atrás.</p>';
        return;
    }

    try {
        const [users, areas, assignments] = await Promise.all([
            UsuariosAPI.getAll(),
            Areas_TrabajoAPI.getAll(),
            fetch(`http://localhost:3000/asignaciones-evaluacion?idUsuarioEvaluador=${targetUserId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${data.token}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            }).then(r => r.json()).catch(() => ({ data: [] }))
        ]);

        allUsers = users;
        areasById = areas.reduce((acc, a) => ({ ...acc, [a._id]: a }), {});
        assignedIds = (assignments.data || []).map(a => extractId(a.id_usuario_evaluado?._id || a.id_usuario_evaluado));
        originalAssignedIds = [...assignedIds];
        allAreaUsers = allUsers;

        renderLists();

        if (btnGuardar) {
            btnGuardar.addEventListener('click', saveChanges);
        }
    } catch (e) {
        console.error('Error cargando datos:', e);
        if (assignedUsersList) {
            assignedUsersList.innerHTML = '<p>Error cargando datos. Revisa la consola.</p>';
        }
    }
}

function extractId(ref) {
    if (!ref) return null;
    if (typeof ref === 'string') return ref;
    if (ref.$oid) return ref.$oid;
    if (ref._id) return (typeof ref._id === 'string') ? ref._id : (ref._id.$oid || null);
    return null;
}

function userBelongsToAreaGeneral(user, areaGeneralId) {
    const areaTrabajoId = extractId(user.id_area_trabajo);
    const area = areasById[areaTrabajoId];
    const generalId = extractId(area?.id_area_general);
    return generalId && generalId === areaGeneralId;
}

function renderLists(searchFilter = '') {
    renderAssignedList();
    renderAvailableList(searchFilter);
}

function renderAssignedList() {
    const assignedUsersList = document.getElementById('assignedUsersList');
    assignedUsersList.innerHTML = '';

    if (assignedIds.length === 0) {
        assignedUsersList.innerHTML = '<p style="padding: 15px; text-align: center; color: #999;">Sin usuarios asignados</p>';
        return;
    }

    const assignedUsers = allAreaUsers.filter(u => assignedIds.includes(extractId(u._id)));

    assignedUsers.forEach(user => {
        const item = document.createElement('div');
        item.className = 'card-box';
        const isNewAssignment = pendingChanges.toAdd.includes(extractId(user._id));
        item.style.opacity = isNewAssignment ? '0.8' : '1';
        item.style.borderLeft = isNewAssignment ? '4px solid #4CAF50' : 'none';

        item.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <p style="margin: 0; font-weight: bold;">${user.nombre} ${user.apellido}</p>
                    <small style="color: #666;">${user.email}</small>
                    ${isNewAssignment ? '<small style="color: #4CAF50;"><i class="fas fa-plus"></i> Nuevo</small>' : ''}
                </div>
                <button class="trash-btn" data-user-id="${user._id}" title="Remover">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        assignedUsersList.appendChild(item);

        const deleteBtn = item.querySelector('.trash-btn');
        deleteBtn.addEventListener('click', () => removeFromAssigned(user._id));
    });
}

function renderAvailableList(searchFilter = '') {
    const availableUsersList = document.getElementById('availableUsersList');
    availableUsersList.innerHTML = '';

    const available = allAreaUsers.filter(u => {
        const userId = extractId(u._id);
        const targetId = extractId(targetUserId);
        return !assignedIds.includes(userId) && userId !== targetId;
    });

    const filtered = available.filter(u => {
        const searchTerm = searchFilter.toLowerCase();
        return `${u.nombre} ${u.apellido} ${u.email}`.toLowerCase().includes(searchTerm);
    });

    if (filtered.length === 0) {
        availableUsersList.innerHTML = '<p style="padding: 15px; text-align: center; color: #999;">No hay usuarios disponibles</p>';
        return;
    }

    filtered.forEach(user => {
        const item = document.createElement('div');
        item.className = 'card-box';
        item.style.cursor = 'pointer';
        item.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <p style="margin: 0; font-weight: bold;">${user.nombre} ${user.apellido}</p>
                    <small style="color: #666;">${user.email}</small>
                </div>
                <i class="fas fa-plus" style="color: #4CAF50; font-size: 18px;"></i>
            </div>
        `;

        item.addEventListener('click', () => addToAssigned(user._id));
        availableUsersList.appendChild(item);
    });
}

function addToAssigned(userId) {
    const userIdStr = extractId(userId);

    if (!assignedIds.includes(userIdStr)) {
        assignedIds.push(userIdStr);

        if (!pendingChanges.toAdd.includes(userIdStr)) {
            pendingChanges.toAdd.push(userIdStr);
        }
        pendingChanges.toRemove = pendingChanges.toRemove.filter(id => id !== userIdStr);
    }

    renderLists();
}

function removeFromAssigned(userId) {
    const userIdStr = extractId(userId);

    assignedIds = assignedIds.filter(id => id !== userIdStr);

    if (originalAssignedIds.includes(userIdStr)) {
        if (!pendingChanges.toRemove.includes(userIdStr)) {
            pendingChanges.toRemove.push(userIdStr);
        }
    }
    pendingChanges.toAdd = pendingChanges.toAdd.filter(id => id !== userIdStr);

    renderLists();
}

async function saveChanges() {
    if (pendingChanges.toAdd.length === 0 && pendingChanges.toRemove.length === 0) {
        alert('No hay cambios para guardar.');
        return;
    }

    btnGuardar.disabled = true;
    const originalText = btnGuardar.innerHTML;
    btnGuardar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';

    try {
        for (const userId of pendingChanges.toAdd) {
            const resp = await fetch('http://localhost:3000/asignaciones-evaluacion', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${data.token}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    idUsuarioEvaluador: targetUserId,
                    idUsuarioEvaluado: userId
                })
            });

            if (!resp.ok) {
                const err = await resp.json().catch(() => ({}));
                throw new Error(err.mensaje || `Error creando asignación para usuario ${userId}`);
            }
        }

        for (const userId of pendingChanges.toRemove) {
            const searchResp = await fetch(
                `http://localhost:3000/asignaciones-evaluacion?idUsuarioEvaluador=${targetUserId}&idUsuarioEvaluado=${userId}`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${data.token}`,
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include'
                }
            );

            if (!searchResp.ok) throw new Error('Error buscando asignación');

            const json = await searchResp.json();
            const assignment = json.data?.[0];

            if (assignment) {
                const deleteResp = await fetch(
                    `http://localhost:3000/asignaciones-evaluacion/${assignment._id}`,
                    {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${data.token}`,
                            'Content-Type': 'application/json'
                        },
                        credentials: 'include'
                    }
                );

                if (!deleteResp.ok) throw new Error('Error eliminando asignación');
            }
        }

        pendingChanges = { toAdd: [], toRemove: [] };
        originalAssignedIds = [...assignedIds];

        alert('Cambios guardados exitosamente.');
        renderLists();

    } catch (err) {
        console.error(err);
        alert(err.message || 'Error al guardar los cambios');

        assignedIds = [...originalAssignedIds];
        pendingChanges = { toAdd: [], toRemove: [] };
        renderLists();
    } finally {
        btnGuardar.disabled = false;
        btnGuardar.innerHTML = originalText;
    }
}
document.addEventListener('DOMContentLoaded', init);
