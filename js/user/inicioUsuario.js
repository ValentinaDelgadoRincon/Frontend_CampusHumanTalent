const data = JSON.parse(localStorage.getItem('data'));
const welcome = document.getElementById('welcome');

welcome.innerHTML = `Bienvenido <br> ${data.usuario.nombre} ${data.usuario.apellido}`;

function setHeaderAvatar() {
    try {
        const userAvatar = document.querySelector('.user-avatar');
        if (!userAvatar) return;

        const setImgSrcOnAvatar = (imgSrc, altText) => {
            const existingImg = userAvatar.querySelector('img');
            if (imgSrc) {
                if (existingImg) {
                    existingImg.src = imgSrc;
                    existingImg.alt = altText || data.usuario.nombre || 'Usuario';
                    existingImg.style.display = 'block';
                } else {
                    userAvatar.innerHTML = `<img src="${imgSrc}" alt="${altText || data.usuario.nombre}">`;
                }
                userAvatar.classList.add('has-image');
            } else {
                if (existingImg) {
                    existingImg.style.display = 'block';
                } else {
                    userAvatar.innerHTML = '<i class="fas fa-user" style="font-size:18px;color:#ffffff"></i>';
                }
                userAvatar.classList.remove('has-image');
            }
        };

        const userFoto = data?.usuario?.foto;
        let imgSrc = '';
        if (userFoto && typeof userFoto === 'string') {
            if (userFoto.startsWith('data:')) imgSrc = userFoto;
            else if (userFoto.startsWith('http')) imgSrc = userFoto;
            else imgSrc = `http://localhost:3000/${userFoto}`;
        }

        if (imgSrc) {
            setImgSrcOnAvatar(imgSrc, `${data.usuario.nombre} ${data.usuario.apellido}`);
            return;
        }

        (async () => {
            try {
                if (!data || !data.usuario || !data.usuario._id) return setImgSrcOnAvatar(null);
                const latest = await UsuariosAPI.getById(data.usuario._id);
                const foto = latest?.foto;
                let latestSrc = '';
                if (foto && typeof foto === 'string') {
                    if (foto.startsWith('data:')) latestSrc = foto;
                    else if (foto.startsWith('http')) latestSrc = foto;
                    else latestSrc = `http://localhost:3000/${foto}`;
                }
                if (latestSrc) setImgSrcOnAvatar(latestSrc, `${latest.nombre} ${latest.apellido}`);
                else setImgSrcOnAvatar(null);
            } catch (e) {
                console.error('Error fetching latest user for avatar:', e);
                setImgSrcOnAvatar(null);
            }
        })();
    } catch (err) {
        console.error('No se pudo setear avatar header:', err);
    }
}

let areasCache = {};
let areasGeneralesCache = {};
let currentUserAreaGeneral = null;
let isAdmin = false;
let allUsers = [];
let areasList = [];

async function loadAreas() {
    try {
        const areas = await Areas_TrabajoAPI.getAll();
        areasList = areas;

        areasCache = areas.reduce((acc, area) => {
            acc[area._id] = area.nombre;
            return acc;
        }, {});
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

        areasGeneralesCache = areas.reduce((acc, area) => {
            const areaGeneralId = area.id_area_general?._id || area.id_area_general;
            acc[area._id] = areaGeneralId;
            return acc;
        }, {});

        currentUserAreaGeneral = areasGeneralesCache[data.usuario.id_area_trabajo];

        const users = await UsuariosAPI.getAll();
        const currentUserId = data.usuario._id;
        const filteredUsers = users.filter(user => user._id !== currentUserId);

        allUsers = filteredUsers;

    } catch (error) {
        console.error('Error al cargar usuarios:', error);
    }
}

async function showAreasGenerales() {
    try {
        const cardsContainer = document.querySelector('.cards-container');
        cardsContainer.innerHTML = '';
        const oldNo = cardsContainer.querySelector('.no-results');
        if (oldNo) oldNo.remove();
        const selectElement = document.getElementById('areasSelect');
        if (selectElement) selectElement.style.display = 'none';
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.disabled = true;
            searchInput.placeholder = 'No hay usuarios para buscar';
            searchInput.value = '';
        }

        const areasGenerales = await AreasGeneralesAPI.getAll();
        if (!areasGenerales || areasGenerales.length === 0) {
            const p = document.createElement('p');
            p.className = 'no-results';
            p.style.cssText = 'grid-column:1/-1;text-align:center;padding:20px';
            p.textContent = 'No hay áreas generales';
            cardsContainer.appendChild(p);
            return;
        }

        areasGenerales.forEach(ag => {
            const card = document.createElement('div');
            card.className = 'area-general-card';
            card.setAttribute('data-ag-id', ag._id);
            card.style.cursor = 'pointer';
            card.innerHTML = `
                <div class="card-content">
                    <h3 class="ag-name">${ag.nombre}</h3>
                    <p class="ag-desc">${ag.descripcion || ''}</p>
                </div>
            `;
            card.addEventListener('click', () => showUsersForAreaGeneral(ag._id));
            cardsContainer.appendChild(card);
        });
    } catch (err) {
        console.error('Error cargando áreas generales:', err);
    }
}

function showUsersForAreaGeneral(areaGeneralId) {
    const cardsContainer = document.querySelector('.cards-container');
    cardsContainer.innerHTML = '';
    const oldNo2 = cardsContainer.querySelector('.no-results');
    if (oldNo2) oldNo2.remove();
    const selectElement = document.getElementById('areasSelect');
    if (selectElement) {
        selectElement.style.display = '';
        selectElement.innerHTML = '';
        const defaultOpt = document.createElement('option');
        defaultOpt.value = '';
        defaultOpt.textContent = 'Todas subáreas';
        selectElement.appendChild(defaultOpt);

        const subareas = areasList.filter(a => {
            const agId = a.id_area_general?._id || a.id_area_general;
            return agId === areaGeneralId;
        });

        subareas.forEach(sa => {
            const opt = document.createElement('option');
            opt.value = sa._id;
            opt.textContent = sa.nombre;
            selectElement.appendChild(opt);
        });
        selectElement.dispatchEvent(new Event('change'));
        const maybeNo = cardsContainer.querySelector('.no-results');
        if (maybeNo) maybeNo.remove();
    }

    const backBtn = document.createElement('button');
    backBtn.className = 'back-button-new';
    backBtn.textContent = '← Volver';
    backBtn.addEventListener('click', () => showAreasGenerales());
    cardsContainer.appendChild(backBtn);

    const usersForAG = allUsers.filter(user => {
        const userAreaGen = areasGeneralesCache[user.id_area_trabajo];
        return userAreaGen && userAreaGen === areaGeneralId;
    });

    const searchInput2 = document.getElementById('searchInput');
    if (searchInput2) {
        if (usersForAG.length > 0) {
            searchInput2.disabled = false;
            searchInput2.placeholder = 'Buscar';
            searchInput2.value = '';
        } else {
            searchInput2.disabled = true;
            searchInput2.placeholder = 'No hay usuarios para buscar';
            searchInput2.value = '';
        }
    }

    if (usersForAG.length === 0) {
        const p = document.createElement('p');
        p.className = 'no-results';
        p.style.cssText = 'grid-column:1/-1;text-align:center;padding:20px';
        p.textContent = 'No hay usuarios para esta área general';
        cardsContainer.appendChild(p);
        return;
    }

    renderUsers(usersForAG);
}

function renderUsers(users) {
    const cardsContainer = document.querySelector('.cards-container');

    const oldNo = cardsContainer.querySelector('.no-results');
    if (oldNo) oldNo.remove();

    let usersGrid = cardsContainer.querySelector('.users-grid');
    if (!usersGrid) {
        usersGrid = document.createElement('div');
        usersGrid.className = 'users-grid';
        usersGrid.style.display = 'grid';
        usersGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(220px, 1fr))';
        usersGrid.style.gridColumn = '1 / -1';
        cardsContainer.appendChild(usersGrid);
    }

    usersGrid.innerHTML = '';

    users.forEach(user => {
        const nombreCompleto = `${user.nombre} ${user.apellido}`;
        const areaNombre = areasCache[user.id_area_trabajo] || 'Sin área asignada';

        const userAreaGeneral = areasGeneralesCache[user.id_area_trabajo];
        const isSameAreaGeneral = userAreaGeneral && currentUserAreaGeneral && userAreaGeneral === currentUserAreaGeneral;
        const requiredMark = isSameAreaGeneral ? '<div class="required-mark">!</div>' : '';

        const promedioActitud = user.estadisticas_evaluacion?.promedio_actitud || 0;
        const promedioAptitud = user.estadisticas_evaluacion?.promedio_aptitud || 0;
        const promedioGeneral = parseFloat(promedioActitud) + parseFloat(promedioAptitud) > 0
            ? (parseFloat(promedioActitud) + parseFloat(promedioAptitud)) / 2
            : 0;

        let scoreHTML = `<div class="score-badge">${promedioGeneral.toFixed(1)}</div>`;
        let avatarContent = '<i class="fas fa-user" style="font-size: 2.5rem; color: #ffffff;"></i>';

        if (user.foto) {
            let imgSrc = '';
            if (typeof user.foto === 'string' && user.foto.startsWith('data:')) {
                imgSrc = user.foto;
            } else if (typeof user.foto === 'string' && user.foto.startsWith('http')) {
                imgSrc = user.foto;
            } else if (user.foto) {
                imgSrc = `http://localhost:3000/${user.foto}`;
            }

            if (imgSrc) {
                avatarContent = `<img src="${imgSrc}" alt="${nombreCompleto}" style="width: 100%; height: 100%; object-fit: cover;">`;
            }
        }

        const cardHTML = `
            <div class="user-card" data-user-id="${user._id}" data-area-id="${user.id_area_trabajo}" ${isSameAreaGeneral ? 'data-same-area-general="true"' : ''}>
                ${requiredMark}
                ${scoreHTML}
                <div class="card-content">
                    <div class="card-avatar">
                        ${avatarContent}
                    </div>
                    <h2 class="card-username">${nombreCompleto}</h2>
                    <p class="card-area">${areaNombre}</p>
                </div>
                <div class="card-footer"></div>
            </div>
        `;
        usersGrid.innerHTML += cardHTML;
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
    setHeaderAvatar();

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
    showAreasGenerales();
});

async function checkIsAdmin() {
    try {
        const dataLocal = JSON.parse(localStorage.getItem('data'));
        if (!dataLocal || !dataLocal.usuario || !dataLocal.usuario.id_rol) return;

        const roleId = dataLocal.usuario.id_rol;
        const resp = await fetch(`http://localhost:3000/roles/${roleId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${dataLocal.token}`,
                'Content-Type': 'application/json'
            },
            credentials: "include"
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
