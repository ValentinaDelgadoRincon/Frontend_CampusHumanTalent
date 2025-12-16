const data = JSON.parse(localStorage.getItem('data'));
const welcome = document.getElementById('welcome');

welcome.innerText = `Bienvenido ${data.usuario.nombre} ${data.usuario.apellido}`;

let areasCache = {};
let isAdmin = false;

async function loadAreas() {
    try {
        const areas = await Areas_TrabajoAPI.getAll();
        
        const selectElement = document.getElementById('areasSelect');
        selectElement.innerHTML = '<option value="">Seleccionar</option>';
        
        areas.forEach(area => {
            const option = document.createElement('option');
            option.value = area._id;
            option.textContent = area.nombre;
            selectElement.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar áreas:', error);
    }
}

async function loadUsers() {
    try {
        const areas = await Areas_TrabajoAPI.getAll();
        areasCache = areas.reduce((acc, area) => {
            acc[area._id] = area.nombre;
            return acc;
        }, {});
        
        const users = await UsuariosAPI.getAll();
        
        const currentUserId = data.usuario._id;
        
        const filteredUsers = users.filter(user => user._id !== currentUserId);
        
        renderUsers(filteredUsers);
    } catch (error) {
        console.error('Error al cargar usuarios:', error);
    }
}

function renderUsers(users) {
    const cardsContainer = document.querySelector('.cards-container');
    cardsContainer.innerHTML = '';
    
    const currentUserAreaId = data.usuario.id_area_trabajo;
    
    users.forEach(user => {
        const nombreCompleto = `${user.nombre} ${user.apellido}`;
        const areaNombre = areasCache[user.id_area_trabajo] || 'Sin área asignada';
        
        const isSameArea = user.id_area_trabajo === currentUserAreaId;
        const requiredMark = isSameArea ? '<div class="required-mark" title="Mismo área">!</div>' : '';
        
        const promedioActitud = user.estadisticas_evaluacion?.promedio_actitud || 0;
        const promedioAptitud = user.estadisticas_evaluacion?.promedio_aptitud || 0;
        const promedioGeneral = parseFloat(promedioActitud) + parseFloat(promedioAptitud) > 0 
            ? (parseFloat(promedioActitud) + parseFloat(promedioAptitud)) / 2 
            : 0;

        let scoreHTML = '';
        if (isAdmin) {
            scoreHTML = `
                <div class="score-badge admin-badges">
                    <div class="badge-act">Act: ${promedioActitud.toFixed(1)}</div>
                    <div class="badge-apt">Apt: ${promedioAptitud.toFixed(1)}</div>
                </div>
            `;
        } else {
            scoreHTML = `<div class="score-badge">${promedioGeneral.toFixed(1)}</div>`;
        }

        const cardHTML = `
            <div class="user-card" data-user-id="${user._id}" data-area-id="${user.id_area_trabajo}" ${isSameArea ? 'data-same-area="true"' : ''}>
                ${requiredMark}
                ${scoreHTML}
                <div class="card-content">
                    <div class="card-avatar"></div>
                    <h2 class="card-username">${nombreCompleto}</h2>
                    <p class="card-area">${areaNombre}</p>
                </div>
                <div class="card-footer"></div>
            </div>
        `;
        cardsContainer.innerHTML += cardHTML;
    });
}

function filterUsers() {
    const searchText = document.getElementById('searchInput').value.toLowerCase();
    const areaSelected = document.getElementById('areasSelect').value;
    const cardsContainer = document.querySelector('.cards-container');
    const userCards = cardsContainer.querySelectorAll('.user-card');
    
    let visibleCount = 0;

    userCards.forEach(card => {
        const userName = card.querySelector('.card-username').textContent.toLowerCase();
        const userAreaId = card.getAttribute('data-area-id');
        
        const matchesSearch = userName.includes(searchText);
        const matchesArea = areaSelected === '' || userAreaId === areaSelected;
        
        if (matchesSearch && matchesArea) {
            card.style.display = 'block';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });

    if (visibleCount === 0) {
        if (cardsContainer.querySelector('.no-results') === null) {
            const noResults = document.createElement('p');
            noResults.className = 'no-results';
            noResults.style.cssText = 'text-align: center; width: 100%; padding: 20px; grid-column: 1 / -1;';
            noResults.textContent = 'No se encontraron usuarios';
            cardsContainer.appendChild(noResults);
        }
    } else {
        const noResults = cardsContainer.querySelector('.no-results');
        if (noResults) {
            noResults.remove();
        }
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const searchInput = document.getElementById('searchInput');
    const areasSelect = document.getElementById('areasSelect');
    
    if (searchInput) {
        searchInput.addEventListener('input', filterUsers);
    }
    if (areasSelect) {
        areasSelect.addEventListener('change', filterUsers);
    }
    
    await checkIsAdmin();
    await loadAreas();
    await loadUsers();
});

async function checkIsAdmin(){
    try {
        const dataLocal = JSON.parse(localStorage.getItem('data'));
        if (!dataLocal || !dataLocal.usuario || !dataLocal.usuario.id_rol) return;

        const roleId = dataLocal.usuario.id_rol;
        const resp = await fetch(`http://localhost:3000/roles/${roleId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${dataLocal.token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!resp.ok) return;
        const role = await resp.json();
        const nombreRol = (role.nombre || '').toLowerCase();
        if (!nombreRol.includes('administrador')) return;

        isAdmin = true;

        const userLinks = document.querySelector('.user-links');
        if (!userLinks) return;

        const backLink = document.createElement('a');
        backLink.href = '../admin/inicioAdmin.html';
        backLink.className = 'back-admin-link';
        backLink.textContent = 'Volver Admin';
        backLink.style.fontWeight = 'bold';
        backLink.style.color = '#083b63';
        backLink.style.margin = '6px 0';

        userLinks.insertBefore(backLink, userLinks.firstChild);
    } catch (error) {
        console.error('No se pudo verificar el rol para mostrar el botón admin-back:', error);
    }
}

document.addEventListener('click', (e) => {
    const userCard = e.target.closest('.user-card');
    if (userCard) {
        const userId = userCard.getAttribute('data-user-id');
        if (userId) {
            window.location.href = `./cvUsuario.html?id=${userId}`;
        }
    }
});
