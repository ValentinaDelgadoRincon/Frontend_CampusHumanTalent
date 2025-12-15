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
    } catch (error) {
        console.error('Error al cargar datos del usuario:', error);
    }
}

function fillUserInfo(user) {
    console.log(user);
    
    const inputName = document.querySelector('.input-name');
    inputName.innerHTML = `${user.nombre} ${user.apellido}`;
    inputName.dataset.userId = user._id;

    const ratingElement = document.querySelector('.rating');
    let ratingValue = user.estadisticas_evaluacion?.promedio_general || 
                      user.estadisticas?.promedio || 
                      0;
    
    ratingValue = parseFloat(ratingValue).toFixed(1);
    ratingElement.textContent = ratingValue;

    const infoSections = document.querySelectorAll('.info-section');
    
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
