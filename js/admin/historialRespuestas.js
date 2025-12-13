const data = JSON.parse(localStorage.getItem('data'));

document.addEventListener('DOMContentLoaded', async () => {
    if (!data || !data.token) {
        window.location.href = '../../index.html';
        return;
    }

    await loadEvaluationHistory();
});

function getEvaluadoIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('evaluadoId') || urlParams.get('id');
}

async function loadEvaluationHistory() {
    const evaluadoId = getEvaluadoIdFromURL();
    const evaluationsList = document.getElementById('evaluationsList');

    if (!evaluadoId) {
        evaluationsList.innerHTML = '<p class="loading-text" style="color: red;">No se especificó un usuario (evaluado)</p>';
        return;
    }

    try {
        const respuestas = await RespuestaEncuestasAPI.getByEvaluadoId(evaluadoId);

        if (!respuestas || respuestas.length === 0) {
            evaluationsList.innerHTML = '<p class="loading-text">No hay respuestas para este usuario</p>';
            return;
        }

        evaluationsList.innerHTML = '';

        const usuariosCache = {};

        async function getUsuarioNombre(idOrObj) {
            if (!idOrObj) return 'Usuario desconocido';

            if (typeof idOrObj === 'object' && idOrObj.nombre) return idOrObj.nombre;

            if (typeof idOrObj === 'object' && idOrObj._id) {
                if (idOrObj.nombre) return idOrObj.nombre;
                idOrObj = idOrObj._id;
            }

            const id = String(idOrObj);
            if (usuariosCache[id]) return usuariosCache[id];

            try {
                const usuario = await UsuariosAPI.getById(id);
                const nombre = usuario?.nombre ? `${usuario.nombre} ${usuario.apellido || ''}`.trim() : 'Usuario desconocido';
                usuariosCache[id] = nombre;
                return nombre;
            } catch (err) {
                console.error('Error obteniendo usuario', id, err);
                usuariosCache[id] = 'Usuario desconocido';
                return 'Usuario desconocido';
            }
        }

        for (const respuesta of respuestas) {
            const card = document.createElement('a');
            card.className = 'card';
            card.href = `../user/encuestaUsuario.html?responseId=${respuesta._id}&id=${evaluadoId}&view=1`;
            card.onclick = (e) => {
                e.preventDefault();
                window.location.href = card.href;
            };

            const avatar = document.createElement('div');
            avatar.className = 'user-avatar';
            avatar.innerHTML = `
                <svg viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
            `;

            const cardText = document.createElement('span');
            cardText.className = 'card-text';

            const nombreEvaluador = await getUsuarioNombre(respuesta.id_usuario_evaluador);

            let puntaje = 'N/A';
            if (respuesta.respuestas && Array.isArray(respuesta.respuestas)) {
                const conteoSi = respuesta.respuestas.filter(r => r.respuesta === 'Sí').length;
                const total = respuesta.respuestas.length;
                if (total > 0) {
                    puntaje = ((conteoSi / total) * 100).toFixed(1);
                }
            }

            cardText.innerHTML = `${nombreEvaluador} calificó » <strong>${puntaje} / 100</strong>`;

            card.appendChild(avatar);
            card.appendChild(cardText);
            evaluationsList.appendChild(card);
        }

    } catch (error) {
        console.error('Error al cargar historial:', error);
        evaluationsList.innerHTML = '<p class="loading-text" style="color: red;">Error al cargar respuestas</p>';
    }
}
