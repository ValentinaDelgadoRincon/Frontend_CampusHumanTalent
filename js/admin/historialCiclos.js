const data = JSON.parse(localStorage.getItem('data'));

document.addEventListener('DOMContentLoaded', async () => {
    if (!data || !data.token) {
        window.location.href = '../../index.html';
        return;
    }

    await loadCycleHistory();
});

function getEvaluadoIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id') || urlParams.get('evaluadoId');
}

async function loadCycleHistory() {
    const evaluadoId = getEvaluadoIdFromURL();
    const cycleList = document.getElementById('cycleList');

    if (!evaluadoId) {
        cycleList.innerHTML = '<p class="loading-text" style="color: red;">No se especificó un usuario (evaluado)</p>';
        return;
    }

    try {
        const ciclos = await CiclosAPI.getAll();
        if (!ciclos || ciclos.length === 0) {
            cycleList.innerHTML = '<p class="loading-text">No hay ciclos disponibles</p>';
            return;
        }

        cycleList.innerHTML = '';

        for (const ciclo of ciclos) {
            const respuestas = await RespuestaEncuestasAPI.getByCicloId(ciclo._id);
            const respuestasFiltradas = (respuestas || []).filter(r => {
                const idEval = r.id_usuario_evaluado?._id || r.id_usuario_evaluado;
                return String(idEval) === String(evaluadoId);
            });

            let promedioCiclo = null;
            if (respuestasFiltradas.length > 0) {
                const puntajes = respuestasFiltradas.map(respuesta => {
                    if (!respuesta.respuestas || !Array.isArray(respuesta.respuestas) || respuesta.respuestas.length === 0) return 0;
                    const conteoSi = respuesta.respuestas.filter(x => x.respuesta === 'Sí').length;
                    const total = respuesta.respuestas.length;
                    return total > 0 ? (conteoSi / total) * 100 : 0;
                });
                const suma = puntajes.reduce((s, v) => s + v, 0);
                promedioCiclo = (suma / puntajes.length).toFixed(1);
            }

            const card = document.createElement('div');
            card.className = 'cycle-card';

            const nombre = document.createElement('span');
            nombre.className = 'cycle-name';
            nombre.textContent = ciclo.nombre || 'Ciclo sin nombre';

            const arrow = document.createElement('span');
            arrow.className = 'arrow-separator';
            arrow.textContent = '→';

            const score = document.createElement('span');
            score.className = 'cycle-score';
            if (promedioCiclo === null) {
                score.textContent = 'Sin calificaciones';
            } else {
                score.textContent = `${promedioCiclo} / 100`;
            }

            card.appendChild(nombre);
            card.appendChild(arrow);
            card.appendChild(score);

            cycleList.appendChild(card);
        }

    } catch (error) {
        console.error('Error al cargar historial de ciclos:', error);
        cycleList.innerHTML = '<p class="loading-text" style="color: red;">Error al cargar historial de ciclos</p>';
    }
}
