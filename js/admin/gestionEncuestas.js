const data = JSON.parse(localStorage.getItem('data'));

document.addEventListener('DOMContentLoaded', async () => {
    if (!data || !data.token) {
        window.location.href = '../../index.html';
        return;
    }

    await loadCycles();
});

async function loadCycles() {
    const cycleList = document.getElementById('cycleList');
    
    try {
        const ciclos = await CiclosAPI.getAll();
        
        if (!ciclos || ciclos.length === 0) {
            cycleList.innerHTML = '<p class="loading-text">No hay ciclos disponibles</p>';
            return;
        }

        cycleList.innerHTML = '';

        ciclos.forEach(ciclo => {
            const card = document.createElement('a');
            card.href = `./historialRespuestas.html?cicloId=${ciclo._id}`;
            card.className = 'cycle-card';
            
            const nombre = document.createElement('span');
            nombre.className = 'cycle-name';
            nombre.textContent = ciclo.nombre || 'Ciclo sin nombre';
            
            const arrow = document.createElement('span');
            arrow.className = 'arrow-separator';
            arrow.textContent = '→';
            
            const estado = document.createElement('span');
            estado.className = 'cycle-score';
            estado.textContent = ciclo.estado || 'N/A';
            
            card.appendChild(nombre);
            card.appendChild(arrow);
            card.appendChild(estado);
            cycleList.appendChild(card);
        });

    } catch (error) {
        console.error('Error al cargar ciclos:', error);
        cycleList.innerHTML = '<p class="loading-text" style="color: red;">Error al cargar los ciclos</p>';
    }
}
