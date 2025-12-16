const data = JSON.parse(localStorage.getItem('data'));
const statsGrid = document.getElementById('statsGrid');

document.addEventListener('DOMContentLoaded', () => {
    if (!data || !data.token) {
        window.location.href = '../../index.html';
        return;
    }
    loadStatistics();
});

async function loadStatistics() {
    try {
        const [areas, usuarios] = await Promise.all([
            Areas_TrabajoAPI.getAll(),
            UsuariosAPI.getAll()
        ]);

        renderStats(areas, usuarios);

    } catch (error) {
        console.error("Error al cargar estadísticas:", error);
        statsGrid.innerHTML = '<p class="loading-text" style="color:red">Error al cargar los datos.</p>';
    }
}

function renderStats(areas, usuarios) {
    statsGrid.innerHTML = '';

    if (areas.length === 0) {
        statsGrid.innerHTML = '<p class="loading-text">No hay áreas registradas.</p>';
        return;
    }

    areas.forEach(area => {
        const usuariosArea = usuarios.filter(u => u.id_area_trabajo === area._id);

        const promedios = calculateAverages(usuariosArea);

        const card = document.createElement('div');
        card.className = 'stat-card';

        card.innerHTML = `
            <h2 class="area-name">${area.nombre}</h2>
            
            <div class="score-block">
                <div class="score-number">${promedios.actitud}</div>
                <div class="score-label">Actitud</div>
            </div>

            <div class="score-block">
                <div class="score-number">${promedios.aptitud}</div>
                <div class="score-label">Aptitud</div>
            </div>
        `;

        statsGrid.appendChild(card);
    });
}

function calculateAverages(usuarios) {
    if (usuarios.length === 0) {
        return { actitud: 'N/A', aptitud: 'N/A' };
    }

    let sumActitud = 0;
    let sumAptitud = 0;
    let count = 0;

    usuarios.forEach(user => {
        const notaActitud = user.estadisticas_evaluacion?.promedio_actitud || 0;
        const notaAptitud = user.estadisticas_evaluacion?.promedio_aptitud || 0;

        sumActitud += parseFloat(notaActitud);
        sumAptitud += parseFloat(notaAptitud);
        count++;
    });

    return {
        actitud: (sumActitud / count).toFixed(1),
        aptitud: (sumAptitud / count).toFixed(1)
    };
}