const data = JSON.parse(localStorage.getItem('data'));
const urlParams = new URLSearchParams(window.location.search);
const surveyId = urlParams.get('id');
const mode = urlParams.get('mode');
const titleInput = document.getElementById('surveyTitleInput');
const surveyQuestionsList = document.getElementById('surveyQuestionsList');
const btnAddQuestion = document.getElementById('btnAddQuestion');
const detailsPanel = document.getElementById('detailsPanel');
const questionsMenuPanel = document.getElementById('questionsMenuPanel');
const tipoEncuestaInput = document.getElementById('tipoEncuestaInput');
const descripcionInput = document.getElementById('descripcionInput');
const fechaCreacionTxt = document.getElementById('fechaCreacion');
const btnSaveChanges = document.getElementById('btnSaveChanges');
const saveActionContainer = document.getElementById('saveActionContainer');
const btnCloseMenu = document.getElementById('btnCloseMenu');
const availableQuestionsList = document.getElementById('availableQuestionsList');
const searchQuestionInput = document.getElementById('searchQuestion');

let currentSurvey = null;
let allQuestions = [];
let surveyQuestionsIds = [];
let originalSurveyData = {};

document.addEventListener('DOMContentLoaded', async () => {
    if (!data || !data.token) {
        window.location.href = '../../index.html';
        return;
    }

    if (mode === 'create') {
        try {
            allQuestions = await PreguntasAPI.getAll();

            let tipos = [];
            try {
                tipos = await TipoEncuestasAPI.getAll();
            } catch (e) {
                console.warn('No se pudieron cargar tipos de encuesta', e);
            }

            const tipoWrapper = document.getElementById('tipoEncuestaInput').parentNode;
            tipoWrapper.innerHTML = `\n                <h3>Tipo de Encuesta:</h3>\n                <select id="tipoEncuestaSelect" class="info-input"></select>\n            `;
            const tipoSelect = document.getElementById('tipoEncuestaSelect');
            const defaultOpt = document.createElement('option');
            defaultOpt.value = '';
            defaultOpt.text = '-- Seleccionar tipo --';
            tipoSelect.appendChild(defaultOpt);
            tipos.forEach(t => {
                const opt = document.createElement('option');
                opt.value = t._id;
                opt.text = t.nombre;
                tipoSelect.appendChild(opt);
            });

            titleInput.value = '';
            descripcionInput.value = '';
            fechaCreacionTxt.textContent = new Date().toLocaleDateString();
            surveyQuestionsIds = [];
            renderSurveyQuestions();
            setupMode();
        } catch (error) {
            console.error('Error preparando modo creación:', error);
        }
        return;
    }

    if (!surveyId) {
        alert("No se especificó encuesta.");
        window.history.back();
        return;
    }

    await loadSurveyData();
    setupMode();
});

async function loadSurveyData() {
    try {
        currentSurvey = await EncuestasAPI.getById(surveyId);
        
        try {
            allQuestions = await PreguntasAPI.getAll();
        } catch (e) {
            allQuestions = [];
        }

        titleInput.value = currentSurvey.titulo || currentSurvey.nombre;
        descripcionInput.value = currentSurvey.descripcion || '';
        
        originalSurveyData = {
            nombre: titleInput.value,
            descripcion: descripcionInput.value,
            id_preguntas: surveyQuestionsIds ? [...surveyQuestionsIds] : []
        };
        
        const fecha = new Date(currentSurvey.fecha_creacion || Date.now());
        fechaCreacionTxt.textContent = fecha.toLocaleDateString();

        if (currentSurvey.id_tipo_encuesta) {
            try {
                const tipo = await TipoEncuestasAPI.getById(currentSurvey.id_tipo_encuesta);
                tipoEncuestaInput.value = tipo.nombre;
            } catch (e) {
                tipoEncuestaInput.value = "Desconocido";
            }
        }

        const preguntasField = currentSurvey.preguntas || currentSurvey.id_preguntas || [];
        if (preguntasField && preguntasField.length > 0) {
            surveyQuestionsIds = preguntasField.map(p => (typeof p === 'object') ? p._id : p);
        } else {
            surveyQuestionsIds = [];
        }

        const missingIds = surveyQuestionsIds.filter(id => !allQuestions.find(q => q._id === id));
        if (missingIds.length > 0) {
            try {
                const fetched = await Promise.all(missingIds.map(id => PreguntasAPI.getById(id)));
                allQuestions = allQuestions.concat(fetched);
            } catch (e) {
                console.warn('No se pudieron obtener todas las preguntas por ID', e);
            }
        }

        renderSurveyQuestions();
        
        btnSaveChanges.disabled = true;
        
        attachChangeListeners();

    } catch (error) {
        console.error("Error cargando datos:", error);
    }
}

function hasChanges() {
    const currentNombre = titleInput.value.trim();
    const currentDescripcion = descripcionInput.value.trim();
    
    if (currentNombre !== originalSurveyData.nombre) return true;
    
    if (currentDescripcion !== originalSurveyData.descripcion) return true;
    
    if (surveyQuestionsIds.length !== originalSurveyData.id_preguntas.length) return true;
    if (!surveyQuestionsIds.every((id, idx) => id === originalSurveyData.id_preguntas[idx])) return true;
    
    return false;
}

function attachChangeListeners() {
    const updateButtonState = () => {
        btnSaveChanges.disabled = !hasChanges();
    };
    titleInput.addEventListener('input', updateButtonState);
    descripcionInput.addEventListener('input', updateButtonState);
}

function renderSurveyQuestions() {
    surveyQuestionsList.innerHTML = '';

    if (surveyQuestionsIds.length === 0) {
        surveyQuestionsList.innerHTML = '<p style="padding:10px">No hay preguntas asignadas.</p>';
        return;
    }

    surveyQuestionsIds.forEach((qId, index) => {
        const questionObj = allQuestions.find(q => q._id === qId);
        const questionText = questionObj ? (questionObj.pregunta || questionObj.texto) : 'Pregunta no encontrada';

        const item = document.createElement('div');
        item.className = 'question-item';
        
        let trashButton = '';
        if (mode === 'edit') {
            trashButton = `<button class="trash-btn" onclick="removeQuestion('${qId}')"><i class="fas fa-trash-alt"></i></button>`;
        }

        item.innerHTML = `
            <span>${index + 1}) ${questionText}</span>
            ${trashButton}
        `;
        surveyQuestionsList.appendChild(item);
    });
}

function setupMode() {
    if (mode === 'edit' || mode === 'create') {
        titleInput.removeAttribute('readonly');
        titleInput.classList.add('editable');
        
        descripcionInput.removeAttribute('readonly');

        btnAddQuestion.classList.remove('hidden');
        saveActionContainer.classList.remove('hidden');

        const tipoSelect = document.getElementById('tipoEncuestaSelect');
        if (tipoSelect) {
            tipoSelect.disabled = false;
        } else {
        }
    } else {
        titleInput.setAttribute('readonly', 'readonly');
        descripcionInput.setAttribute('readonly', 'readonly');
        const tipoSelect = document.getElementById('tipoEncuestaSelect');
        if (tipoSelect) {
            tipoSelect.disabled = true;
        } else if (tipoEncuestaInput) {
            tipoEncuestaInput.setAttribute('readonly', 'readonly');
        }
        
        btnAddQuestion.classList.add('hidden');
        saveActionContainer.classList.add('hidden');
    }
}


btnAddQuestion.addEventListener('click', () => {
    questionsMenuPanel.classList.remove('hidden');
    renderAvailableQuestions();
});

btnCloseMenu.addEventListener('click', () => {
    questionsMenuPanel.classList.add('hidden');
});

function renderAvailableQuestions(filter = '') {
    availableQuestionsList.innerHTML = '';
    
    const candidates = allQuestions.filter(q => !surveyQuestionsIds.includes(q._id));
    
    const filtered = candidates.filter(q => {
        const txt = (q.pregunta || q.texto).toLowerCase();
        return txt.includes(filter.toLowerCase());
    });

    if (filtered.length === 0) {
        availableQuestionsList.innerHTML = '<p style="padding:10px">No hay preguntas disponibles.</p>';
        return;
    }

    filtered.forEach((q, index) => {
        const div = document.createElement('div');
        div.className = 'avail-item';
        div.textContent = `${index + 1}) ${q.pregunta || q.texto}`;
        div.onclick = () => addQuestion(q._id);
        availableQuestionsList.appendChild(div);
    });
}

searchQuestionInput.addEventListener('input', (e) => {
    renderAvailableQuestions(e.target.value);
});

window.addQuestion = (id) => {
    surveyQuestionsIds.push(id);
    renderSurveyQuestions();
    renderAvailableQuestions(searchQuestionInput.value);
    btnSaveChanges.disabled = !hasChanges();
};

window.removeQuestion = (id) => {
    surveyQuestionsIds = surveyQuestionsIds.filter(existingId => existingId !== id);
    renderSurveyQuestions();
    if (!questionsMenuPanel.classList.contains('hidden')) {
        renderAvailableQuestions(searchQuestionInput.value);
    }
    btnSaveChanges.disabled = !hasChanges();
};

btnSaveChanges.addEventListener('click', async () => {
    try {
        const nombreValue = titleInput.value && titleInput.value.trim();
        if (!nombreValue) {
            alert('El nombre de la encuesta es obligatorio');
            return;
        }

        if (!Array.isArray(surveyQuestionsIds) || surveyQuestionsIds.length === 0) {
            alert('Debe seleccionar al menos una pregunta para la encuesta');
            return;
        }

        const payload = {
            nombre: nombreValue,
            descripcion: descripcionInput.value || '',
            id_preguntas: surveyQuestionsIds
        };

        const tipoSelect = document.getElementById('tipoEncuestaSelect');
        if (tipoSelect && tipoSelect.value) {
            payload.id_tipo_encuesta = tipoSelect.value;
        }

        let response;
        if (mode === 'create') {
            response = await fetch(`http://localhost:3000/encuestas`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${data.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const created = await response.json();
                if (created && (created._id || created.id)) {
                    const id = created._id || created.id;
                    window.location.href = `./gestionEncuesta.html?id=${id}&mode=view`;
                    return;
                }
                window.history.back();
                return;
            } else {
                let errText = 'Error al crear la encuesta';
                try {
                    const errJson = await response.json();
                    if (errJson && errJson.errors) {
                        errText = errJson.errors.map(e => e.msg || e.message).join('\n');
                    } else if (errJson && errJson.mensaje) {
                        errText = errJson.mensaje;
                    }
                } catch (e) {
                    const txt = await response.text();
                    if (txt) errText = txt;
                }
                alert(errText);
                return;
            }
        } else {
            response = await fetch(`http://localhost:3000/encuestas/${surveyId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${data.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                window.location.href = `./gestionEncuesta.html?id=${surveyId}&mode=view`;
                return;
            } else {
                let errText = 'Error al actualizar la encuesta';
                try {
                    const errJson = await response.json();
                    if (errJson && errJson.errors) {
                        errText = errJson.errors.map(e => e.msg || e.message).join('\n');
                    } else if (errJson && errJson.mensaje) {
                        errText = errJson.mensaje;
                    }
                } catch (e) {}
                alert(errText);
            }
        }
    } catch (error) {
        console.error(error);
        alert('Error de conexión');
    }
});