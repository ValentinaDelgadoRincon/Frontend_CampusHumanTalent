const data = JSON.parse(localStorage.getItem('data'));
const preguntasListContainer = document.getElementById('preguntasList');
const fabAdd = document.getElementById('fabAdd');
const formModal = document.getElementById('formModal');
const preguntaForm = document.getElementById('preguntaForm');
const nombrePreguntaInput = document.getElementById('nombrePregunta');
const tipoPreguntaSelect = document.getElementById('tipoPreguntaSelect');
const tipoRespuestaSelect = document.getElementById('tipoRespuestaSelect');
const modalTitle = document.getElementById('modalTitle');
const btnFormAction = document.getElementById('btnFormAction');
const btnCloseForm = document.getElementById('btnCloseForm');
const deleteModal = document.getElementById('deleteModal');
const btnConfirmDelete = document.getElementById('btnConfirmDelete');
const btnCloseDelete = document.getElementById('btnCloseDelete');

let isEditing = false;
let currentPreguntaId = null;
let preguntaToDeleteId = null;
let tiposPreguntas = [];
let tiposRespuestas = [];

document.addEventListener('DOMContentLoaded', async () => {
    if (!data || !data.token) {
        window.location.href = '../../index.html';
        return;
    }
    
    await loadTipos();
    loadPreguntas();
});

async function loadTipos() {
    try {
        tiposPreguntas = await TipoPreguntasAPI.getAll();
        tiposRespuestas = await TipoRespuestasAPI.getAll();
    } catch (error) {
        console.error('Error cargando tipos:', error);
    }
}

async function loadPreguntas() {
    try {
        const preguntas = await PreguntasAPI.getAll();
        renderPreguntas(preguntas);
    } catch (error) {
        console.error(error);
        preguntasListContainer.innerHTML = '<p class="loading-text" style="color:red">Error al cargar preguntas</p>';
    }
}

function renderPreguntas(preguntas) {
    preguntasListContainer.innerHTML = '';
    
    if (preguntas.length === 0) {
        preguntasListContainer.innerHTML = '<p class="loading-text">No hay preguntas registradas</p>';
        return;
    }

    preguntas.forEach(pregunta => {
        const row = document.createElement('div');
        row.className = 'area-row';
        const textoP = pregunta.pregunta || pregunta.texto || 'Sin texto';
        row.innerHTML = `
            <div class="area-box">${textoP}</div>
            <button class="btn-edit" onclick="openEditModal('${pregunta._id}', '${textoP.replace(/'/g, "\\'")}', '${pregunta.id_tipo_pregunta || ''}', '${pregunta.id_tipo_respuesta || ''}')">Editar</button>
            <button class="btn-delete" onclick="openDeleteModal('${pregunta._id}')">
                <i class="fas fa-trash-alt"></i>
            </button>
        `;
        preguntasListContainer.appendChild(row);
    });
}

function renderTipoSelects() {
    tipoPreguntaSelect.innerHTML = '<option value="">-- Seleccionar tipo --</option>';
    tiposPreguntas.forEach(tipo => {
        const option = document.createElement('option');
        option.value = tipo._id;
        option.textContent = tipo.nombre;
        tipoPreguntaSelect.appendChild(option);
    });

    tipoRespuestaSelect.innerHTML = '<option value="">-- Seleccionar tipo --</option>';
    tiposRespuestas.forEach(tipo => {
        const option = document.createElement('option');
        option.value = tipo._id;
        option.textContent = tipo.nombre;
        tipoRespuestaSelect.appendChild(option);
    });
}

fabAdd.addEventListener('click', () => {
    isEditing = false;
    currentPreguntaId = null;
    modalTitle.textContent = 'Añadir Nueva Pregunta';
    nombrePreguntaInput.placeholder = 'Escribe el texto de la pregunta';
    nombrePreguntaInput.value = '';
    tipoPreguntaSelect.value = '';
    tipoRespuestaSelect.value = '';
    btnFormAction.textContent = 'Guardar';
    renderTipoSelects();
    formModal.classList.add('show');
    nombrePreguntaInput.focus();
});

window.openEditModal = (id, texto, idTipoPregunta, idTipoRespuesta) => {
    isEditing = true;
    currentPreguntaId = id;
    modalTitle.textContent = 'Editar Pregunta';
    nombrePreguntaInput.value = texto;
    btnFormAction.textContent = 'Confirmar Cambios';
    renderTipoSelects();
    tipoPreguntaSelect.value = idTipoPregunta || '';
    tipoRespuestaSelect.value = idTipoRespuesta || '';
    formModal.classList.add('show');
    nombrePreguntaInput.focus();
};

btnCloseForm.addEventListener('click', () => {
    formModal.classList.remove('show');
});

preguntaForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const textoValue = nombrePreguntaInput.value.trim();
    const idTipoPregunta = tipoPreguntaSelect.value;
    const idTipoRespuesta = tipoRespuestaSelect.value;

    if (!textoValue || !idTipoPregunta || !idTipoRespuesta) {
        alert('Por favor completa todos los campos');
        return;
    }

    const url = isEditing 
        ? `http://localhost:3000/preguntas/${currentPreguntaId}`
        : `http://localhost:3000/preguntas`;
    
    const method = isEditing ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Authorization': `Bearer ${data.token}`,
                'Content-Type': 'application/json'
            },
                credentials: "include",
            body: JSON.stringify({ 
                pregunta: textoValue,
                id_tipo_pregunta: idTipoPregunta,
                id_tipo_respuesta: idTipoRespuesta
            })
        });

        if (response.ok) {
            formModal.classList.remove('show');
            loadPreguntas();
        } else {
            alert('Error al guardar la pregunta');
        }
    } catch (error) {
        console.error(error);
        alert('Error de conexión');
    }
});


window.openDeleteModal = (id) => {
    preguntaToDeleteId = id;
    deleteModal.classList.add('show');
};

btnConfirmDelete.addEventListener('click', async () => {
    if (!preguntaToDeleteId) return;

    try {
        const response = await fetch(`http://localhost:3000/preguntas/${preguntaToDeleteId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${data.token}`,
                'Content-Type': 'application/json'
            },
                credentials: "include"
        });

        if (response.ok) {
            deleteModal.classList.remove('show');
            loadPreguntas();
        } else {
            alert('Error al eliminar la pregunta (puede que esté asociada a una encuesta)');
        }
    } catch (error) {
        console.error(error);
        alert('Error de conexión');
    }
});

btnCloseDelete.addEventListener('click', () => {
    deleteModal.classList.remove('show');
    preguntaToDeleteId = null;
});

window.onclick = (event) => {
    if (event.target == formModal) {
        formModal.classList.remove('show');
    }
    if (event.target == deleteModal) {
        deleteModal.classList.remove('show');
    }
};
