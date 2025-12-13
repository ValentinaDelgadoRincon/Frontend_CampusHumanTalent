const data = JSON.parse(localStorage.getItem('data'));
let tiposEncuestasCache = {};
let tiposPreguntasCache = {};
let tiposRespuestasCache = {};
let preguntasPorTipo = {};
let usuarioEvaluado = null;
let cicloActivo = null;
let encuestaActiva = null;

function getUsuarioIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

async function loadSurveyData() {
    try {
        const usuarioEvaluadoId = getUsuarioIdFromURL();
        
        if (!usuarioEvaluadoId) {
            throw new Error('No se especificó un usuario a evaluar');
        }

        usuarioEvaluado = await UsuariosAPI.getById(usuarioEvaluadoId);

        cicloActivo = await CiclosAPI.getActivo();
        if (!cicloActivo) {
            throw new Error('No hay un ciclo de evaluación activo');
        }

        const encuestas = await EncuestasAPI.getAll();
        encuestaActiva = encuestas.find(e => e._id === cicloActivo.encuesta_Id) || encuestas[0];
        if (!encuestaActiva) {
            throw new Error('No hay una encuesta disponible');
        }

        const tiposEncuestas = await TipoEncuestasAPI.getAll();
        tiposEncuestasCache = tiposEncuestas.reduce((acc, tipo) => {
            acc[tipo._id] = tipo.nombre;
            return acc;
        }, {});

        const tiposPreguntas = await TipoPreguntasAPI.getAll();
        tiposPreguntasCache = tiposPreguntas.reduce((acc, tipo) => {
            acc[tipo._id] = tipo.nombre;
            return acc;
        }, {});

        const tiposRespuestas = await TipoRespuestasAPI.getAll();
        tiposRespuestasCache = tiposRespuestas.reduce((acc, tipo) => {
            acc[tipo._id] = tipo.nombre;
            return acc;
        }, {});

        const preguntas = await PreguntasAPI.getAll();
        
        preguntasPorTipo = preguntas.reduce((acc, pregunta) => {
            const tipoId = pregunta.id_tipo_pregunta;
            if (!acc[tipoId]) {
                acc[tipoId] = [];
            }
            acc[tipoId].push(pregunta);
            return acc;
        }, {});

        renderSurveyForm();
    } catch (error) {
        console.error('Error al cargar datos de la encuesta:', error);
        document.querySelector('.form-grid').innerHTML = '<p style="text-align: center; color: red;">Error al cargar las preguntas</p>';
    }
}

function renderSurveyForm() {
    const formGrid = document.querySelector('.form-grid');
    formGrid.innerHTML = '';

    if (Object.keys(preguntasPorTipo).length === 0) {
        formGrid.innerHTML = '<p>No se encontraron preguntas para evaluar.</p>';
        return;
    }

    Object.entries(preguntasPorTipo).forEach(([tipoId, preguntas]) => {
        const tipoNombreRaw = tiposPreguntasCache[tipoId] || 'General';
        
        const tituloColumna = tipoNombreRaw.toLowerCase().includes('preguntas') 
            ? `${tipoNombreRaw}:` 
            : `Preguntas ${tipoNombreRaw.toLowerCase()}:`;

        const columnDiv = document.createElement('div');
        columnDiv.className = 'column';
        
        const titleH2 = document.createElement('h2');
        titleH2.textContent = tituloColumna;
        columnDiv.appendChild(titleH2);

        preguntas.forEach((pregunta, index) => {
            const questionBlock = document.createElement('div');
            questionBlock.className = 'question-block';
            
            const questionText = document.createElement('p');
            questionText.className = 'question-text';
            const textContent = pregunta.pregunta || pregunta.texto || 'Sin texto';
            questionText.textContent = `${index + 1}) ${textContent}`;
            
            const optionsRow = document.createElement('div');
            optionsRow.className = 'options-row';

            const radioName = `pregunta-${pregunta._id}`;

            const labelSi = document.createElement('label');
            labelSi.className = 'option';
            labelSi.innerHTML = `
                <input type="radio" name="${radioName}" value="si">
                <span class="custom-box"></span>
                <span class="option-label">Sí</span>
            `;

            const labelNo = document.createElement('label');
            labelNo.className = 'option';
            labelNo.innerHTML = `
                <input type="radio" name="${radioName}" value="no">
                <span class="custom-box"></span>
                <span class="option-label">No</span>
            `;

            optionsRow.appendChild(labelSi);
            optionsRow.appendChild(labelNo);
            
            questionBlock.appendChild(questionText);
            questionBlock.appendChild(optionsRow);
            columnDiv.appendChild(questionBlock);
        });

        formGrid.appendChild(columnDiv);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    
    loadSurveyData();

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
            const respuestas = [];
            const formElements = form.elements;

            for (let i = 0; i < formElements.length; i++) {
                const element = formElements[i];
                
                if (element.type === 'radio' && element.checked) {
                    const preguntaId = element.name.replace('pregunta-', '');
                    
                    if (preguntaId && preguntaId !== 'undefined') {
                        respuestas.push({
                            id_pregunta: preguntaId,
                            respuesta: element.value
                        });
                    }
                }
            }

            if (respuestas.length === 0) {
                alert('Por favor responde todas las preguntas');
                return;
            }

            const encuestaData = {
                id_ciclo: cicloActivo._id,
                id_encuesta: encuestaActiva._id,
                id_usuario_evaluador: data.usuario._id,
                id_usuario_evaluado: usuarioEvaluado._id,
                id_area_trabajo: usuarioEvaluado.id_area_trabajo,
                id_cargo: usuarioEvaluado.id_cargo,
                respuestas: respuestas
            };

            await RespuestaEncuestasAPI.create(encuestaData);
            
            alert('¡Encuesta enviada correctamente!');
            window.location.href = './inicioUsuario.html';
        } catch (error) {
            console.error('Error al enviar la encuesta:', error);
            alert('Error al enviar la encuesta: ' + error.message);
        }
    });
});
