const data = JSON.parse(localStorage.getItem('data'));
const cargosListContainer = document.getElementById('areasList');
const fabAdd = document.getElementById('fabAdd');
const formModal = document.getElementById('formModal');
const cargoForm = document.getElementById('areaForm');
const nombreCargoInput = document.getElementById('nombreArea');
const modalTitle = document.getElementById('modalTitle');
const btnFormAction = document.getElementById('btnFormAction');
const btnCloseForm = document.getElementById('btnCloseForm');
const deleteModal = document.getElementById('deleteModal');
const btnConfirmDelete = document.getElementById('btnConfirmDelete');
const btnCloseDelete = document.getElementById('btnCloseDelete');

let isEditing = false;
let currentCargoId = null;
let cargoToDeleteId = null;

document.addEventListener('DOMContentLoaded', () => {
    if (!data || !data.token) {
        window.location.href = '../../index.html';
        return;
    }
    loadCargos();
});

async function loadCargos() {
    try {
        const cargos = await CargosAPI.getAll();
        renderCargos(cargos);
    } catch (error) {
        console.error(error);
        cargosListContainer.innerHTML = '<p class="loading-text" style="color:red">Error al cargar cargos</p>';
    }
}

function renderCargos(cargos) {
    cargosListContainer.innerHTML = '';
    
    if (cargos.length === 0) {
        cargosListContainer.innerHTML = '<p class="loading-text">No hay cargos registrados</p>';
        return;
    }

    cargos.forEach(cargo => {
        const row = document.createElement('div');
        row.className = 'area-row';
        row.innerHTML = `
            <div class="area-box">${cargo.nombre}</div>
            <button class="btn-edit" onclick="openEditModal('${cargo._id}', '${cargo.nombre}')">Editar</button>
            <button class="btn-delete" onclick="openDeleteModal('${cargo._id}')">
                <i class="fas fa-trash-alt"></i>
            </button>
        `;
        cargosListContainer.appendChild(row);
    });
}

fabAdd.addEventListener('click', () => {
    isEditing = false;
    currentCargoId = null;
    modalTitle.textContent = 'Añadir Nuevo Cargo';
    nombreCargoInput.placeholder = 'Escribe el nombre del cargo';
    nombreCargoInput.value = '';
    btnFormAction.textContent = 'Guardar';
    formModal.classList.add('show');
    nombreCargoInput.focus();
});

window.openEditModal = (id, nombre) => {
    isEditing = true;
    currentCargoId = id;
    modalTitle.textContent = 'Editar Nombre del Cargo';
    nombreCargoInput.value = nombre;
    btnFormAction.textContent = 'Confirmar Cambios';
    formModal.classList.add('show');
    nombreCargoInput.focus();
};

btnCloseForm.addEventListener('click', () => {
    formModal.classList.remove('show');
});

cargoForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nombreValue = nombreCargoInput.value.trim();
    if (!nombreValue) return;

    const url = isEditing 
        ? `http://localhost:3000/cargos/${currentCargoId}`
        : `http://localhost:3000/cargos`;
    
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
            loadCargos();
        } else {
            alert('Error al guardar el cargo');
        }
    } catch (error) {
        console.error(error);
        alert('Error de conexión');
    }
});


window.openDeleteModal = (id) => {
    cargoToDeleteId = id;
    deleteModal.classList.add('show');
};

btnConfirmDelete.addEventListener('click', async () => {
    if (!cargoToDeleteId) return;

    try {
        const response = await fetch(`http://localhost:3000/cargos/${cargoToDeleteId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${data.token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            deleteModal.classList.remove('show');
            loadCargos();
        } else {
            alert('Error al eliminar el cargo (puede que tenga usuarios asociados)');
        }
    } catch (error) {
        console.error(error);
        alert('Error de conexión');
    }
});

btnCloseDelete.addEventListener('click', () => {
    deleteModal.classList.remove('show');
    cargoToDeleteId = null;
});

window.onclick = (event) => {
    if (event.target == formModal) {
        formModal.classList.remove('show');
    }
    if (event.target == deleteModal) {
        deleteModal.classList.remove('show');
    }
};
