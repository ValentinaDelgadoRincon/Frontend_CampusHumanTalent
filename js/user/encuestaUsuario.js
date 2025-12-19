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

function getResponseIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('responseId');
}

function isViewMode() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('view') === '1' || urlParams.get('view') === 'true';
}

async function loadSurveyData() {
    try {
        const responseId = getResponseIdFromURL();
        const usuarioEvaluadoId = getUsuarioIdFromURL();

        let responseObj = null;
        if (responseId) {
            responseObj = await RespuestaEncuestasAPI.getById(responseId);
        }

        if (responseObj) {
            const idEvaluado = responseObj.id_usuario_evaluado?._id || responseObj.id_usuario_evaluado || usuarioEvaluadoId;
            if (!idEvaluado) throw new Error('Respuesta no contiene usuario evaluado');
            usuarioEvaluado = await UsuariosAPI.getById(idEvaluado);
            var encuestas = await EncuestasAPI.getAll();
        } else {
            if (!usuarioEvaluadoId) {
                throw new Error('No se especificó un usuario a evaluar');
            }
            usuarioEvaluado = await UsuariosAPI.getById(usuarioEvaluadoId);

            try {
                if (typeof CiclosAPI.getActivo === 'function') {
                    cicloActivo = await CiclosAPI.getActivo();
                }
            } catch (e) {
                cicloActivo = null;
            }

            if (!cicloActivo) {
                try {
                    const ciclosAll = await CiclosAPI.getAll();
                    cicloActivo = (ciclosAll || []).find(c => c.estado === 'Abierto') || null;
                } catch (e) {
                    cicloActivo = null;
                }
            }

            if (!cicloActivo || cicloActivo.estado !== 'Abierto') {
                throw new Error('No hay un ciclo de evaluación activo');
            }

            var encuestas = await EncuestasAPI.getAll();
        }
        const normalizeId = (v) => {
            if (!v) return v;
            if (typeof v === 'string') return v;
            if (typeof v === 'object') {
                if (v.$oid) return v.$oid;
                if (v.toString) return v.toString();
            }
            return String(v);
        };

        let encuestaIdFromCiclo = null;
        if (responseObj && responseObj.id_encuesta) {
            encuestaIdFromCiclo = normalizeId(responseObj.id_encuesta);
        } else if (cicloActivo) {
            encuestaIdFromCiclo = normalizeId(cicloActivo.encuesta_Id);
        }

        encuestaActiva = encuestas.find(e => e._id === encuestaIdFromCiclo) || encuestas[0];
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

        const encuestaQuestionIds = (encuestaActiva.id_preguntas || encuestaActiva.preguntas || []).map(normalizeId);
        const preguntasFiltradas = preguntas.filter(p => {
            const pid = normalizeId(p._id);
            return encuestaQuestionIds.length === 0 ? false : encuestaQuestionIds.includes(pid);
        });

        preguntasPorTipo = preguntasFiltradas.reduce((acc, pregunta) => {
            const tipoId = pregunta.id_tipo_pregunta;
            if (!acc[tipoId]) {
                acc[tipoId] = [];
            }
            acc[tipoId].push(pregunta);
            return acc;
        }, {});

        renderSurveyForm();

        try {
            const form = document.querySelector('form');
            const submitBtn = form.querySelector('.btn-enviar');

            const updateSubmitState = () => {
                const radios = Array.from(form.querySelectorAll('input[type="radio"]'));
                const names = [...new Set(radios.map(r => r.name))];
                if (names.length === 0) {
                    if (submitBtn) {
                        submitBtn.disabled = true;
                        submitBtn.style.backgroundColor = '#ccc';
                        submitBtn.style.cursor = 'not-allowed';
                    }
                    return;
                }

                let answered = 0;
                names.forEach(name => {
                    if (form.querySelector(`input[name="${name}"]:checked`)) answered++;
                });

                const allAnswered = (answered === names.length);
                if (submitBtn) {
                    submitBtn.disabled = !allAnswered;
                    if (!allAnswered) {
                        submitBtn.style.backgroundColor = '#ccc';
                        submitBtn.style.cursor = 'not-allowed';
                        submitBtn.style.opacity = '0.8';
                    } else {
                        submitBtn.style.backgroundColor = '';
                        submitBtn.style.cursor = '';
                        submitBtn.style.opacity = '';
                    }
                }
            };

            form.querySelectorAll('input[type="radio"]').forEach(r => {
                r.addEventListener('change', updateSubmitState);
            });

            updateSubmitState();
        } catch (e) {
            console.warn('No se pudo inicializar validación de envío:', e);
        }

        if (responseObj) {
            document.body.classList.add('read-only');
            applyResponseAnswers(responseObj);
            const footer = document.querySelector('.footer');
            if (footer) footer.style.display = 'none';
        }
    } catch (error) {
        console.error('Error al cargar datos de la encuesta:', error);
        const message = (error && error.message) ? error.message : 'Error al cargar las preguntas';
        document.querySelector('.form-grid').innerHTML = `<p style="text-align: center; color: red;">${message}</p>`;
        const form = document.querySelector('form');
        if (form) {
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.disabled = true;
        }
    }
}

function applyResponseAnswers(responseObj) {
    if (!responseObj || !responseObj.respuestas) return;
    const respuestasMap = {};
    responseObj.respuestas.forEach(r => {
        respuestasMap[String(r.id_pregunta)] = r.respuesta;
    });

    for (const preguntaId in respuestasMap) {
        const radioName = `pregunta-${preguntaId}`;
        const radios = document.getElementsByName(radioName);
        if (!radios || radios.length === 0) continue;
        for (const radio of radios) {
            if (radio.value === respuestasMap[preguntaId]) {
                radio.checked = true;
            }
            radio.disabled = true;
        }
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
                <input type="radio" name="${radioName}" value="Sí">
                <span class="custom-box"></span>
                <span class="option-label">Sí</span>
            `;

            const labelNo = document.createElement('label');
            labelNo.className = 'option';
            labelNo.innerHTML = `
                <input type="radio" name="${radioName}" value="No">
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
            const radios = Array.from(form.querySelectorAll('input[type="radio"]'));
            const names = [...new Set(radios.map(r => r.name))];
            let answeredCount = 0;
            names.forEach(name => { if (form.querySelector(`input[name="${name}"]:checked`)) answeredCount++; });
            if (names.length === 0 || answeredCount !== names.length) {
                alert('Por favor responde todas las preguntas antes de enviar');
                return;
            }
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
            
            try {
                const currentUser = data.usuario;
                if (currentUser && currentUser.id_rol) {
                    const roleResp = await fetch(`http://localhost:3000/roles/${currentUser.id_rol}`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${data.token}`,
                            'Content-Type': 'application/json'
                        },
                        credentials: "include"
                    });
                    
                    if (roleResp.ok) {
                        const role = await roleResp.json();
                        const isAdmin = (role.nombre || '').toLowerCase().includes('administrador');
                        
                        if (isAdmin) {
                            window.location.href = '../admin/inicioAdmin.html';
                            return;
                        }
                    }
                }
            } catch (e) {
                console.error('Error verificando rol para redirección:', e);
            }
            
            window.location.href = './inicioUsuario.html';
        } catch (error) {
            console.error('Error al enviar la encuesta:', error);
            alert('Error al enviar la encuesta: ' + error.message);
        }
    });
});
