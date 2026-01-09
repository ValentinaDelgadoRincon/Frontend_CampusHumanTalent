const data = JSON.parse(localStorage.getItem('data'));
const statsGrid = document.getElementById('statsGrid');
let currentView = 'areas-generales';
let currentAreaGeneralId = null;
let usuariosCache = [];
let areasTrabajoCache = [];

const backArrow = document.getElementById('backArrow');

document.addEventListener('DOMContentLoaded', () => {
    if (!data || !data.token) {
        window.location.href = '../../index.html';
        return;
    }
    loadStatistics();



backArrow.addEventListener('click', (e) => {
    e.preventDefault();

    if (currentView === 'sub-areas') {
        loadStatistics();
    } else {
        window.history.back();
    }
});
});

async function loadStatistics() {
    try {
        const areasGenerales = await AreasGeneralesAPI.getAll();
        usuariosCache = await UsuariosAPI.getAll();
        areasTrabajoCache = await Areas_TrabajoAPI.getAll();

        showAreasGenerales(areasGenerales);

    } catch (error) {
        console.error("Error al cargar estadísticas:", error);
        statsGrid.innerHTML = '<p class="loading-text" style="color:red">Error al cargar los datos.</p>';
    }
}

function showAreasGenerales(areasGenerales) {
    statsGrid.innerHTML = '';
    currentView = 'areas-generales';

    if (areasGenerales.length === 0) {
        statsGrid.innerHTML = '<p class="loading-text">No hay áreas generales registradas.</p>';
        return;
    }

    areasGenerales.forEach(areaGeneral => {
        const usuariosAreaGeneral = usuariosCache.filter(usuario => {
            const areasTrabajo = areasTrabajoCache.find(a => a._id === usuario.id_area_trabajo);
            if (!areasTrabajo) return false;

            const areaGeneralId = typeof areasTrabajo.id_area_general === 'string'
                ? areasTrabajo.id_area_general
                : areasTrabajo.id_area_general._id;

            return areaGeneralId === areaGeneral._id;
        });

        const promedios = calculateAverages(usuariosAreaGeneral);

        if (promedios.actitud === 'N/A' && promedios.aptitud === 'N/A') return


        const card = document.createElement('div');
        card.className = 'stat-card';
        card.style.cursor = 'pointer';

        card.innerHTML = `
            <h2 class="area-name">${areaGeneral.nombre}</h2>
            
            <div class="score-block">
                <div class="score-number">${promedios.actitud}</div>
                <div class="score-label">Actitud</div>
            </div>

            <div class="score-block">
                <div class="score-number">${promedios.aptitud}</div>
                <div class="score-label">Aptitud</div>
            </div>
        `;

        card.addEventListener('click', () => {
            showSubAreas(areaGeneral._id, areaGeneral.nombre);
        });

        statsGrid.appendChild(card);
    });
}

function showSubAreas(areaGeneralId, areaGeneralName) {
    statsGrid.innerHTML = '';
    currentView = 'sub-areas';
    currentAreaGeneralId = areaGeneralId;

    const subAreas = areasTrabajoCache.filter(area => {
        const areaGeneralIdValue = typeof area.id_area_general === 'string'
            ? area.id_area_general
            : area.id_area_general._id;
        return areaGeneralIdValue === areaGeneralId;
    });

    if (subAreas.length === 0) {
        statsGrid.innerHTML = '<p class="loading-text">No hay sub-áreas en esta área general.</p>';
        return;
    }

    const subAreasHeader = document.createElement('div');
    subAreasHeader.className = 'sub-areas-header';
    subAreasHeader.innerHTML = `
        <h2 class="sub-areas-title">${areaGeneralName}</h2>
    `;
    statsGrid.appendChild(subAreasHeader);

    const subAreasContainer = document.createElement('div');
    subAreasContainer.className = 'sub-areas-cards';

    subAreas.forEach(subArea => {
        const usuariosSubArea = usuariosCache.filter(u => u.id_area_trabajo === subArea._id);

        const promedios = calculateAverages(usuariosSubArea);

        if (promedios.actitud === 'N/A' && promedios.aptitud === 'N/A') {
            return;
        }

        const card = document.createElement('div');
        card.className = 'stat-card sub-area-card';

        card.innerHTML = `
            <h3 class="area-name">${subArea.nombre}</h3>
            
            <div class="score-block">
                <div class="score-number">${promedios.actitud}</div>
                <div class="score-label">Actitud</div>
            </div>

            <div class="score-block">
                <div class="score-number">${promedios.aptitud}</div>
                <div class="score-label">Aptitud</div>
            </div>
        `;

        subAreasContainer.appendChild(card);
    });

    statsGrid.appendChild(subAreasContainer);
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