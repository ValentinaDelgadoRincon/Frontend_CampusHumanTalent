const data = JSON.parse(localStorage.getItem('data'));
const form = document.getElementById('createUserForm');
const areaSelect = document.getElementById('area');
const cargoSelect = document.getElementById('cargo');
const rolSelect = document.getElementById('rol');
const photoInput = document.getElementById('photoInput');
const imageDisplay = document.getElementById('imageDisplay');
const defaultIcon = document.querySelector('.default-icon');
const formErrors = document.getElementById('formErrors');

let rolesCache = {};
let estadosCache = {};
let fotoBase64 = null;

document.addEventListener('DOMContentLoaded', async () => {
    if (!data || !data.token) {
        window.location.href = '../../index.html';
        return;
    }
    await loadSelectOptions();
});

async function loadSelectOptions() {
    try {
        const [areas, cargos, roles, estados] = await Promise.all([
            Areas_TrabajoAPI.getAll(),
            CargosAPI.getAll(),
            fetch(`http://localhost:3000/roles`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${data.token}`,
                    'Content-Type': 'application/json'
                },
                credentials: "include"
            }).then(res => res.json()),
            fetch(`http://localhost:3000/estados`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${data.token}`,
                    'Content-Type': 'application/json'
                },
                credentials: "include"
            }).then(res => res.json())
        ]);

        rolesCache = roles.reduce((acc, rol) => {
            acc[rol.nombre] = rol._id;
            return acc;
        }, {});

        estadosCache = estados.reduce((acc, estado) => {
            acc[estado.nombre] = estado._id;
            return acc;
        }, {});

        areas.forEach(area => {
            const option = document.createElement('option');
            option.value = area._id;
            option.textContent = area.nombre;
            areaSelect.appendChild(option);
        });

        cargos.forEach(cargo => {
            const option = document.createElement('option');
            option.value = cargo._id;
            option.textContent = cargo.nombre;
            cargoSelect.appendChild(option);
        });

        roles.forEach(rol => {
            const option = document.createElement('option');
            option.value = rol._id;
            option.textContent = rol.nombre;
            rolSelect.appendChild(option);
        });

    } catch (error) {
        console.error("Error cargando opciones:", error);
    }
}

photoInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const maxSize = 2 * 1024 * 1024;
        if (file.size > maxSize) {
            alert('La imagen no puede exceder 2MB');
            photoInput.value = '';
            fotoBase64 = null;
            imageDisplay.classList.add('hidden');
            defaultIcon.style.display = 'block';
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            fotoBase64 = e.target.result;
            imageDisplay.src = e.target.result;
            imageDisplay.classList.remove('hidden');
            defaultIcon.style.display = 'none';
        }
        reader.readAsDataURL(file);
    }
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = document.querySelector('.btn-create');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Creando...';
    submitBtn.disabled = true;

    try {
        const areaValue = areaSelect.value;
        const cargoValue = cargoSelect.value;
        const rolValue = rolSelect.value;

        if (!areaValue) {
            alert('Por favor selecciona un área');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            return;
        }

        if (!cargoValue) {
            alert('Por favor selecciona un cargo');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            return;
        }

        if (!rolValue) {
            alert('Por favor selecciona un rol');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            return;
        }

        const payload = {
            nombre: document.getElementById('nombre').value,
            apellido: document.getElementById('apellido').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            id_area_trabajo: areaValue,
            id_cargo: cargoValue,
            telefono: document.getElementById('telefono').value || '0000000000',
            linkedIn: document.getElementById('linkedin').value || 'https://www.linkedin.com/in/',
            id_rol: rolValue,
            id_estado: estadosCache['Activo']
        };

        if (fotoBase64) {
            payload.foto = fotoBase64;
        }

        if (!payload.id_estado) {
            console.error('Estado "Activo" no encontrado');
            alert('Error: No se pudo asignar el estado activo');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            return;
        }

        const response = await fetch('http://localhost:3000/usuarios', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${data.token}`
            },
                credentials: "include",
            body: JSON.stringify(payload)
        });

        const result = await response.json().catch(() => ({}));

        if (response.ok) {
            clearFormErrors();
            alert('Usuario creado exitosamente');
            window.location.href = './inicioAdmin.html';
        } else {
            if (result && Array.isArray(result.errors) && result.errors.length) {
                showValidationErrors(result.errors);
            } else if (result && Array.isArray(result) && result.length) {
                showValidationErrors(result);
            } else if (result && (result.mensaje || result.message)) {
                showFormMessage(result.mensaje || result.message);
            } else {
                showFormMessage('Error al crear el usuario');
            }
        }

    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión con el servidor');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});

function showValidationErrors(errors) {
    if (!formErrors) return;
    clearFormErrors();
    const ul = document.createElement('ul');
    errors.forEach(err => {
        const li = document.createElement('li');
        li.textContent = err.msg || err.message || JSON.stringify(err);
        ul.appendChild(li);

        const fieldName = err.path || err.param || err.field;
        if (fieldName) {
            const field = form.querySelector(`[name="${fieldName}"]`) || document.getElementById(fieldName);
            if (field) {
                field.classList.add('input-error');
            }
        }
    });
    formErrors.appendChild(ul);
    formErrors.style.display = 'block';
}

function showFormMessage(msg) {
    if (!formErrors) return alert(msg);
    clearFormErrors();
    formErrors.textContent = msg;
    formErrors.style.display = 'block';
}

function clearFormErrors() {
    if (!formErrors) return;
    formErrors.innerHTML = '';
    formErrors.style.display = 'none';
    const errorFields = form.querySelectorAll('.input-error');
    errorFields.forEach(f => f.classList.remove('input-error'));
}

form.addEventListener('input', (e) => {
    const target = e.target;
    if (target && target.classList && target.classList.contains('input-error')) {
        target.classList.remove('input-error');
    }
    if (formErrors && formErrors.children.length === 0) {
        formErrors.style.display = 'none';
    }
});