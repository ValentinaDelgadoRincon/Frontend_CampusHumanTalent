const data = JSON.parse(localStorage.getItem('data'));
const areasListContainer = document.getElementById('areasList');
const fabAdd = document.getElementById('fabAdd');
const formModal = document.getElementById('formModal');
const areaForm = document.getElementById('areaForm');
const nombreAreaInput = document.getElementById('nombreArea');
const modalTitle = document.getElementById('modalTitle');
const btnFormAction = document.getElementById('btnFormAction');
const btnCloseForm = document.getElementById('btnCloseForm');
const deleteModal = document.getElementById('deleteModal');
const btnConfirmDelete = document.getElementById('btnConfirmDelete');
const btnCloseDelete = document.getElementById('btnCloseDelete');

let isEditing = false;
let currentAreaId = null;
let areaToDeleteId = null;

document.addEventListener('DOMContentLoaded', () => {
    if (!data || !data.token) {
        window.location.href = '../../index.html';
        return;
    }
    loadAreas();
});

async function loadAreas() {
    try {
        const areas = await Areas_TrabajoAPI.getAll();
        renderAreas(areas);
    } catch (error) {
        console.error(error);
        areasListContainer.innerHTML = '<p class="loading-text" style="color:red">Error al cargar áreas</p>';
    }
}

function renderAreas(areas) {
    areasListContainer.innerHTML = '';
    
    if (areas.length === 0) {
        areasListContainer.innerHTML = '<p class="loading-text">No hay áreas registradas</p>';
        return;
    }

    areas.forEach(area => {
        const row = document.createElement('div');
        row.className = 'area-row';
        row.innerHTML = `
            <div class="area-box">${area.nombre}</div>
            <button class="btn-edit" onclick="openEditModal('${area._id}', '${area.nombre}')">Editar</button>
            <button class="btn-delete" onclick="openDeleteModal('${area._id}')">
                <i class="fas fa-trash-alt"></i>
            </button>
        `;
        areasListContainer.appendChild(row);
    });
}

fabAdd.addEventListener('click', () => {
    isEditing = false;
    currentAreaId = null;
    modalTitle.textContent = 'Añadir Nueva Área';
    nombreAreaInput.placeholder = 'Escribe el nombre del área';
    nombreAreaInput.value = '';
    btnFormAction.textContent = 'Guardar';
    formModal.classList.add('show');
    nombreAreaInput.focus();
});

window.openEditModal = (id, nombre) => {
    isEditing = true;
    currentAreaId = id;
    modalTitle.textContent = 'Editar Nombre del Área';
    nombreAreaInput.value = nombre;
    btnFormAction.textContent = 'Confirmar Cambios';
    formModal.classList.add('show');
    nombreAreaInput.focus();
};

btnCloseForm.addEventListener('click', () => {
    formModal.classList.remove('show');
});

areaForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nombreValue = nombreAreaInput.value.trim();
    if (!nombreValue) return;

    const url = isEditing 
        ? `http://localhost:3000/areas-trabajo/${currentAreaId}`
        : `http://localhost:3000/areas-trabajo`;
    
    const method = isEditing ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Authorization': `Bearer ${data.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nombre: nombreValue })
        });

        if (response.ok) {
            formModal.classList.remove('show');
            loadAreas();
        } else {
            alert('Error al guardar el área');
        }
    } catch (error) {
        console.error(error);
        alert('Error de conexión');
    }
});


window.openDeleteModal = (id) => {
    areaToDeleteId = id;
    deleteModal.classList.add('show');
};

btnConfirmDelete.addEventListener('click', async () => {
    if (!areaToDeleteId) return;

    try {
        const response = await fetch(`http://localhost:3000/areas-trabajo/${areaToDeleteId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${data.token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            deleteModal.classList.remove('show');
            loadAreas();
        } else {
            alert('Error al eliminar el área (puede que tenga usuarios asociados)');
        }
    } catch (error) {
        console.error(error);
        alert('Error de conexión');
    }
});

btnCloseDelete.addEventListener('click', () => {
    deleteModal.classList.remove('show');
    areaToDeleteId = null;
});

window.onclick = (event) => {
    if (event.target == formModal) {
        formModal.classList.remove('show');
    }
    if (event.target == deleteModal) {
        deleteModal.classList.remove('show');
    }
};