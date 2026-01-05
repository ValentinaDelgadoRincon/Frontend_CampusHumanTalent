const data = JSON.parse(localStorage.getItem('data'));
let areasCache = {};
let cargosCache = {};
let currentUser = data.usuario;

async function loadUserData() {
    try {
        const userData = await UsuariosAPI.getById(data.usuario._id);
        currentUser = userData;

        const areas = await Areas_TrabajoAPI.getAll();
        areasCache = areas.reduce((acc, area) => {
            acc[area._id] = area.nombre;
            return acc;
        }, {});

        const cargos = await CargosAPI.getAll();
        cargosCache = cargos.reduce((acc, cargo) => {
            acc[cargo._id] = cargo.nombre;
            return acc;
        }, {});

        fillUserInfo(currentUser);
        adjustRatingsForRole(currentUser);
    } catch (error) {
        console.error('Error al cargar datos del usuario:', error);
    }
}

function fillUserInfo(user) {
    console.log(user);

    try {
        const avatarEl = document.querySelector('.avatar');
        if (avatarEl) {
            const foto = user.foto;
            let imgSrc = '';
            if (foto && typeof foto === 'string') {
                if (foto.startsWith('data:')) imgSrc = foto;
                else if (foto.startsWith('http')) imgSrc = foto;
                else imgSrc = `http://localhost:3000/${foto}`;
            }

            const existingImg = avatarEl.querySelector('img');
            if (imgSrc) {
                if (existingImg) {
                    existingImg.src = imgSrc;
                    existingImg.alt = `${user.nombre} ${user.apellido}`;
                    existingImg.style.display = 'block';
                } else {
                    avatarEl.innerHTML = `<img src="${imgSrc}" alt="${user.nombre} ${user.apellido}">`;
                }
            } else {
                if (!existingImg) avatarEl.innerHTML = '<i class="fas fa-user"></i>';
            }
        }
    } catch (e) {
        console.error('Error setting avatar in profile:', e);
    }
    
    const inputName = document.querySelector('.input-name');
    inputName.innerHTML = `${user.nombre} ${user.apellido}`;
    inputName.dataset.userId = user._id;

    const ratingElement = document.querySelector('.rating');
    let ratingValue = user.estadisticas_evaluacion?.promedio_general || 
                      user.estadisticas?.promedio || 
                      0;
    
    if (ratingValue === 0 && user.estadisticas_evaluacion) {
        const act = user.estadisticas_evaluacion.promedio_actitud || 0;
        const apt = user.estadisticas_evaluacion.promedio_aptitud || 0;
        ratingValue = (parseFloat(act) + parseFloat(apt)) / 2;
    }
    
    ratingValue = parseFloat(ratingValue).toFixed(1);
    ratingElement.textContent = ratingValue;

    const leftColSections = document.querySelectorAll('.left-col .info-section');
    const sobreMiSection = leftColSections[0];
    sobreMiSection.querySelector('h3').textContent = 'Sobre mí';
    sobreMiSection.querySelector('p').textContent = user.sobremi || 'Sin descripción';
    sobreMiSection.dataset.field = 'sobremi';
    sobreMiSection.dataset.value = user.sobremi || '';

    const infoSections = document.querySelectorAll('.right-col .info-section');
    
    const cargoSection = infoSections[0];
    cargoSection.querySelector('h3').textContent = 'Cargo';
    cargoSection.querySelector('p').textContent = cargosCache[user.id_cargo] || 'Cargo no asignado';
    cargoSection.dataset.field = 'cargo';
    cargoSection.dataset.value = user.id_cargo || '';

    const areaSection = infoSections[1];
    areaSection.querySelector('h3').textContent = 'Área a la que pertenezco';
    areaSection.querySelector('p').textContent = areasCache[user.id_area_trabajo] || 'Área no asignada';
    areaSection.dataset.field = 'area';
    areaSection.dataset.value = user.id_area_trabajo || '';

    const contactSection = infoSections[2];
    const contactList = contactSection.querySelector('.contact-list');
    contactList.innerHTML = '';

    const linkedInLi = document.createElement('li');
    linkedInLi.innerHTML = `
        <i class="fab fa-linkedin-in"></i>
        <a href="${user.linkedIn || '#'}" target="_blank">${user.linkedIn ? 'Ver Perfil LinkedIn' : 'Agregar link LinkedIn'}</a>
    `;
    linkedInLi.dataset.field = 'linkedIn';
    linkedInLi.dataset.value = user.linkedIn || '';
    contactList.appendChild(linkedInLi);

    const emailLi = document.createElement('li');
    emailLi.innerHTML = `
        <i class="far fa-envelope"></i>
        <a href="mailto:${user.email}">${user.email}</a>
    `;
    emailLi.dataset.field = 'email';
    emailLi.dataset.value = user.email || '';
    contactList.appendChild(emailLi);

    const phoneLi = document.createElement('li');
    phoneLi.innerHTML = `
        <i class="fas fa-phone-alt"></i>
        <a href="tel:${user.telefono || '#'}">${user.telefono || 'Agregar Número de teléfono'}</a>
    `;
    phoneLi.dataset.field = 'telefono';
    phoneLi.dataset.value = user.telefono || '';
    contactList.appendChild(phoneLi);
}

async function adjustRatingsForRole(user) {
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

        const ratingElement = document.querySelector('.rating');
        const act = user.estadisticas_evaluacion?.promedio_actitud || 0;
        const apt = user.estadisticas_evaluacion?.promedio_aptitud || 0;
        if (ratingElement) ratingElement.textContent = `Act: ${parseFloat(act).toFixed(1)} Apt: ${parseFloat(apt).toFixed(1)}`;
    } catch (error) {
        console.error('Error ajustando ratings por rol:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const editBtn = document.querySelector('.input-edit');
    const closeBtn = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const editForm = document.getElementById('editForm');
    const modal = document.getElementById('editModal');
    

    if (editBtn) {
        editBtn.addEventListener('click', () => {
            openEditModal();
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            closeEditModal();
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            closeEditModal();
        });
    }

    if (editForm) {
        editForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveUserData();
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeEditModal();
        }
    });

    loadUserData();
});

function openEditModal() {
    const modal = document.getElementById('editModal');
    
    const sobreMiInput = document.getElementById('sobreMi');
    const linkedInInput = document.getElementById('linkedIn');
    const emailInput = document.getElementById('email');
    const telefonoInput = document.getElementById('telefono');
    
    if (sobreMiInput) sobreMiInput.value = currentUser.sobremi || '';
    if (linkedInInput) linkedInInput.value = currentUser.linkedIn || '';
    if (emailInput) emailInput.value = currentUser.email || '';
    if (telefonoInput) telefonoInput.value = currentUser.telefono || '';

    if (modal) {
        modal.classList.add('show');
    }
}

function closeEditModal() {
    const modal = document.getElementById('editModal');
    modal.classList.remove('show');
}

async function saveUserData() {
    try {
        const sobreMiInput = document.getElementById('sobreMi');
        const linkedInInput = document.getElementById('linkedIn');
        const telefonoInput = document.getElementById('telefono');

        if (!sobreMiInput || !linkedInInput || !telefonoInput) {
            throw new Error('Algunos campos del formulario no se encontraron');
        }

        const updateData = {
            sobremi: sobreMiInput.value,
            linkedIn: linkedInInput.value,
            telefono: telefonoInput.value
        };

        const response = await fetch(`http://localhost:3000/usuarios/perfil/${currentUser._id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${data.token}`,
                'Content-Type': 'application/json'
            },
                credentials: "include",
            body: JSON.stringify(updateData)
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const updatedUser = await response.json();
        
        currentUser = { ...currentUser, ...updateData };
        data.usuario = currentUser;
        localStorage.setItem('data', JSON.stringify(data));

        closeEditModal();
        alert('Información actualizada correctamente');
        
        location.reload();
    } catch (error) {
        console.error('Error al guardar datos:', error);
        alert('Error al guardar los datos: ' + error.message);
    }
}
