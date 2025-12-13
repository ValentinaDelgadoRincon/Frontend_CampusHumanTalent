const data = JSON.parse(localStorage.getItem('data'));
let areasCache = {};
let cargosCache = {};

function getUserIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

async function loadUserData() {
    try {
        const userId = getUserIdFromURL();
        
        if (!userId) {
            console.error('No se proporcionó ID de usuario');
            return;
        }

        const user = await UsuariosAPI.getById(userId);
        
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

        fillUserInfo(user);
    } catch (error) {
        console.error('Error al cargar datos del usuario:', error);
        document.querySelector('.main-container').innerHTML = '<p style="text-align: center; padding: 40px; font-size: 18px;">Error al cargar el perfil del usuario</p>';
    }
}

function fillUserInfo(user) {
    const userName = document.querySelector('.user-name');
    const userDesc = document.querySelector('.user-desc');
    
    userName.textContent = `${user.nombre} ${user.apellido}`;
    userDesc.textContent = user.sobremi || 'Descripción profesional no disponible';

    const cargoBlocks = document.querySelectorAll('.info-block');
    const cargoBlock = cargoBlocks[0];
    const cargoTitle = cargoBlock.querySelector('h3');
    const cargoParagraph = cargoBlock.querySelector('p');
    
    cargoTitle.textContent = 'Cargo';
    cargoParagraph.textContent = cargosCache[user.id_cargo] || 'Cargo no asignado';

    const areaBlock = cargoBlocks[1];
    const areaTitle = areaBlock.querySelector('h3');
    const areaParagraph = areaBlock.querySelector('p');
    
    areaTitle.textContent = 'Área a la que pertenezco';
    areaParagraph.textContent = areasCache[user.id_area_trabajo] || 'Área no asignada';

    const contactList = document.querySelector('.contact-list');
    contactList.innerHTML = '';

    if (user.linkedIn) {
        const linkedInLi = document.createElement('li');
        linkedInLi.innerHTML = `
            <i class="fab fa-linkedin"></i>
            <a href="${user.linkedIn}" target="_blank">Perfil LinkedIn</a>
        `;
        contactList.appendChild(linkedInLi);
    }

    const emailLi = document.createElement('li');
    emailLi.innerHTML = `
        <i class="fas fa-envelope"></i>
        <a href="mailto:${user.email}">${user.email}</a>
    `;
    contactList.appendChild(emailLi);

    if (user.telefono) {
        const phoneLi = document.createElement('li');
        phoneLi.innerHTML = `
            <i class="fas fa-phone-alt"></i>
            <a href="tel:${user.telefono}">${user.telefono}</a>
        `;
        contactList.appendChild(phoneLi);
    }

    const ratingNumber = document.querySelector('.rating-number');
    let ratingValue = user.estadisticas_evaluacion?.promedio_general || 
                      user.estadisticas?.promedio || 
                      0;
    ratingValue = parseFloat(ratingValue).toFixed(1);
    ratingNumber.textContent = ratingValue;

    const btnCalificar = document.querySelector('.btn-calificar');
    if (btnCalificar) {
        btnCalificar.href = `./encuestaUsuario.html?id=${user._id}`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadUserData();
});