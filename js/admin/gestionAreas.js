const data = JSON.parse(localStorage.getItem('data'));
const areasListContainer = document.getElementById('areasList');
const fabAdd = document.getElementById('fabAdd');
const formModal = document.getElementById('formModal');
const areaForm = document.getElementById('areaForm');
const nombreAreaInput = document.getElementById('nombreArea');
const modalTitle = document.getElementById('modalTitle');
const btnFormAction = document.getElementById('btnFormAction');
const btnCloseForm = document.getElementById('btnCloseForm');
const formError = document.getElementById('formError');
const deleteModal = document.getElementById('deleteModal');
const deleteError = document.getElementById('deleteError');
const deleteConfirmText = document.getElementById('deleteConfirmText');
const btnConfirmDelete = document.getElementById('btnConfirmDelete');
const btnCloseDelete = document.getElementById('btnCloseDelete');

let isEditing = false;
let currentAreaId = null;
let areaToDeleteId = null;
let currentAreaGeneralId = null;
let viewMode = 'areas-generales';
let currentCreatingType = null;
let areasGeneralesCache = {};
let allAreasTrabajo = [];

document.addEventListener('DOMContentLoaded', () => {
    if (!data || !data.token) {
        window.location.href = '../../index.html';
        return;
    }
    loadAreasGenerales();
});

async function loadAreasGenerales() {
    try {
        const response = await fetch('http://localhost:3000/areas-generales', {
            headers: { 'Authorization': `Bearer ${data.token}` },
            credentials: "include"
        });
        const areasGenerales = await response.json();
        areasGeneralesCache = {};
        areasGenerales.forEach(area => {
            areasGeneralesCache[area._id] = area.nombre;
        });
        viewMode = 'areas-generales';
        renderAreasGenerales(areasGenerales);
    } catch (error) {
        console.error(error);
        areasListContainer.innerHTML = '<p class="loading-text" style="color:red">Error al cargar áreas generales</p>';
    }
}

function renderAreasGenerales(areasGenerales) {
    areasListContainer.innerHTML = '';
    
    if (areasGenerales.length === 0) {
        areasListContainer.innerHTML = '<p class="loading-text">No hay áreas generales registradas</p>';
        return;
    }

    const container = document.createElement('div');
    container.className = 'areas-generales-grid';

    areasGenerales.forEach(area => {
        const card = document.createElement('div');
        card.className = 'area-general-card';
        card.innerHTML = `
            <div class="card-content">
                <div class="card-name">${area.nombre}</div>
                <div class="card-actions">
                    <button class="card-btn edit-btn" onclick="openEditModal('${area._id}', '${area.nombre}')" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="card-btn delete-btn" onclick="openDeleteModal('${area._id}')" title="Eliminar">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
        `;
        card.onclick = (e) => {
            if (!e.target.closest('.card-actions')) {
                loadAreasTrabajoPorAreaGeneral(area._id, area.nombre);
            }
        };
        container.appendChild(card);
    });

    areasListContainer.appendChild(container);
}

async function loadAreasTrabajoPorAreaGeneral(areaGeneralId, areaGeneralNombre) {
    try {
        const response = await fetch(`http://localhost:3000/areas-generales/${areaGeneralId}/sub-areas`, {
            headers: { 'Authorization': `Bearer ${data.token}` },
            credentials: "include"
        });
        const data_response = await response.json();
        allAreasTrabajo = data_response.areas_trabajo;
        currentAreaGeneralId = areaGeneralId;
        viewMode = 'areas-trabajo';
        renderAreasTrabajo(allAreasTrabajo, areaGeneralNombre);
    } catch (error) {
        console.error(error);
        areasListContainer.innerHTML = '<p class="loading-text" style="color:red">Error al cargar áreas de trabajo</p>';
    }
}

function renderAreasTrabajo(areas, areaGeneralNombre) {
    areasListContainer.innerHTML = '';
    
    const headerDiv = document.createElement('div');
    headerDiv.className = 'sub-areas-header';
    headerDiv.innerHTML = `
        <button class="back-button-new" onclick="loadAreasGenerales()">← Volver</button>
        <h2>${areaGeneralNombre}</h2>
    `;
    areasListContainer.appendChild(headerDiv);

    if (areas.length === 0) {
        areasListContainer.innerHTML = headerDiv.innerHTML + '<p class="loading-text">No hay áreas de trabajo en esta área general</p>';
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
    formError.style.display = 'none';
    formError.textContent = '';
    
    if (viewMode === 'areas-generales') {
        currentCreatingType = 'area-general';
        modalTitle.textContent = 'Añadir Nueva Área General';
        nombreAreaInput.placeholder = 'Escribe el nombre del área general';
        nombreAreaInput.value = '';
        btnFormAction.textContent = 'Guardar';
    } else {
        currentCreatingType = 'area-trabajo';
        modalTitle.textContent = 'Añadir Nueva Área de Trabajo';
        nombreAreaInput.placeholder = 'Escribe el nombre del área';
        nombreAreaInput.value = '';
        btnFormAction.textContent = 'Guardar';
    }
    
    formModal.classList.add('show');
    nombreAreaInput.focus();
});

window.openEditModal = (id, nombre) => {
    isEditing = true;
    currentAreaId = id;
    formError.style.display = 'none';
    formError.textContent = '';
    
    if (viewMode === 'areas-generales') {
        currentCreatingType = 'area-general';
        modalTitle.textContent = 'Editar Área General';
    } else {
        currentCreatingType = 'area-trabajo';
        modalTitle.textContent = 'Editar Área de Trabajo';
    }
    
    nombreAreaInput.value = nombre;
    btnFormAction.textContent = 'Confirmar Cambios';
    formModal.classList.add('show');
    nombreAreaInput.focus();
};

btnCloseForm.addEventListener('click', () => {
    formModal.classList.remove('show');
    formError.style.display = 'none';
    formError.textContent = '';
});

areaForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nombreValue = nombreAreaInput.value.trim();
    if (!nombreValue) return;

    let url, method, body;

    if (currentCreatingType === 'area-general') {
        url = isEditing 
            ? `http://localhost:3000/areas-generales/${currentAreaId}`
            : `http://localhost:3000/areas-generales`;
        method = isEditing ? 'PUT' : 'POST';
        body = { nombre: nombreValue };
    } else {
        url = isEditing 
            ? `http://localhost:3000/areas-trabajo/${currentAreaId}`
            : `http://localhost:3000/areas-trabajo`;
        method = isEditing ? 'PUT' : 'POST';
        body = { nombre: nombreValue };
        
        if (!isEditing && currentAreaGeneralId) {
            body.id_area_general = currentAreaGeneralId;
        }
    }

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Authorization': `Bearer ${data.token}`,
                'Content-Type': 'application/json'
            },
            credentials: "include",
            body: JSON.stringify(body)
        });

        if (response.ok) {
            formModal.classList.remove('show');
            
            if (currentCreatingType === 'area-general') {
                loadAreasGenerales();
            } else if (currentAreaGeneralId) {
                loadAreasTrabajoPorAreaGeneral(currentAreaGeneralId, areasGeneralesCache[currentAreaGeneralId]);
            } else {
                loadAreasGenerales();
            }
        } else {
            const errorData = await response.json().catch(() => ({ mensaje: 'Error al guardar el área' }));
            formError.textContent = errorData.mensaje || 'Error al guardar el área';
            formError.style.display = 'block';
        }
    } catch (error) {
        console.error(error);
        alert('Error de conexión');
    }
});


window.openDeleteModal = (id) => {
    areaToDeleteId = id;
    deleteError.style.display = 'none';
    deleteError.textContent = '';
    deleteConfirmText.style.display = 'block';
    deleteModal.classList.add('show');
};


btnConfirmDelete.addEventListener('click', async () => {
    if (!areaToDeleteId) return;

    let url;
    if (viewMode === 'areas-generales') {
        url = `http://localhost:3000/areas-generales/${areaToDeleteId}`;
    } else {
        url = `http://localhost:3000/areas-trabajo/${areaToDeleteId}`;
    }

    try {
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${data.token}`,
                'Content-Type': 'application/json'
            },
            credentials: "include"
        });

        if (response.ok) {
            deleteModal.classList.remove('show');
            if (viewMode === 'areas-generales') {
                loadAreasGenerales();
            } else if (currentAreaGeneralId) {
                loadAreasTrabajoPorAreaGeneral(currentAreaGeneralId, areasGeneralesCache[currentAreaGeneralId]);
            } else {
                loadAreasGenerales();
            }
        } else {
            const errorData = await response.json().catch(() => ({ mensaje: 'Error al eliminar el área' }));
            deleteError.textContent = errorData.mensaje || 'Error al eliminar el área';
            deleteError.style.display = 'block';
            deleteConfirmText.style.display = 'none';
        }
    } catch (error) {
        console.error(error);
        alert('Error de conexión');
    }
});

btnCloseDelete.addEventListener('click', () => {
    deleteModal.classList.remove('show');
    deleteError.style.display = 'none';
    deleteError.textContent = '';
    deleteConfirmText.style.display = 'block';
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