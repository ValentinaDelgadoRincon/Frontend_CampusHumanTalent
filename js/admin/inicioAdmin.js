const data = JSON.parse(localStorage.getItem('data'));
const adminNameSpan = document.getElementById('adminName');
const btnLogout = document.getElementById('logoutBtn');
const btnIniciar = document.getElementById('btnIniciarCiclo');
const btnTerminar = document.getElementById('btnTerminarCiclo');
const statusText = document.getElementById('statusText');
const cycleModal = document.getElementById('cycleModal');
const cycleForm = document.getElementById('cycleForm');
const btnCancelModal = document.getElementById('btnCancelModal');
const encuestaSelect = document.getElementById('encuestaSelect');
const btnAddEncuesta = document.getElementById('btnAddEncuesta');
const addEncuestaContainer = document.getElementById('addEncuestaContainer');
const gestionEncuestasModal = document.getElementById('gestionEncuestasModal');
const encuestasListContainer = document.getElementById('encuestasListContainer');
const btnGuardarEncuestas = document.getElementById('btnGuardarEncuestas');
const btnCancelGestionEncuestas = document.querySelector('#gestionEncuestasModal .btn-cancel');
const btnGestionEncuestas = document.getElementById('btnGestionEncuestas');

document.addEventListener('DOMContentLoaded', async () => {
    if (!data || !data.token) {
        window.location.href = '../index.html';
        return;
    }

    const isAdmin = await validateAdminRole();

    if (!isAdmin) {
        alert('Acceso no autorizado');
        window.location.href = '../user/inicioUsuario.html';
        return;
    }

    adminNameSpan.textContent = `${data.usuario.nombre}`;

    checkCicloStatus();
});

btnLogout.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('data');
    window.location.href = '../index.html';
});

async function validateAdminRole() {
    try {
        const currentUser = data.usuario;
        if (!currentUser || !currentUser.id_rol) return false;

        const roleResp = await fetch(`http://localhost:3000/roles/${currentUser.id_rol}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${data.token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!roleResp.ok) return false;

        const role = await roleResp.json();
        return (role.nombre || '').toLowerCase().includes('administrador');
    } catch (error) {
        console.error('Error validando rol:', error);
        return false;
    }
}

async function checkCicloStatus() {
    try {
        const ciclos = await CiclosAPI.getAll();
        const cicloActivo = ciclos.find(c => c.estado === 'Abierto');

        if (cicloActivo) {
            statusText.textContent = `Ciclo Activo: ${cicloActivo.nombre}`;
            statusText.style.color = 'green';
            btnIniciar.disabled = true;
            btnIniciar.style.opacity = '0.5';
            btnTerminar.disabled = false;
            btnTerminar.style.opacity = '1';
            btnTerminar.dataset.idCiclo = cicloActivo._id;
        } else {
            statusText.textContent = 'No hay ciclo activo';
            statusText.style.color = 'red';
            btnIniciar.disabled = false;
            btnIniciar.style.opacity = '1';
            btnTerminar.disabled = true;
            btnTerminar.style.opacity = '0.5';
        }

    } catch (error) {
        console.error('Error al verificar ciclos:', error);
        statusText.textContent = 'Error de conexión';
    }
}

btnIniciar.addEventListener('click', async () => {
    try {
        const encuestas = await EncuestasAPI.getAll();

        encuestaSelect.innerHTML = '<option value="" disabled selected>Seleccionar Encuesta</option>';
        encuestas.forEach(encuesta => {
            const option = document.createElement('option');
            option.value = encuesta._id;
            option.textContent = encuesta.titulo || encuesta.nombre || `Encuesta ${encuesta._id}`;
            encuestaSelect.appendChild(option);
        });

        cycleModal.classList.add('show');

    } catch (error) {
        console.error("Error cargando encuestas:", error);
        alert("Error al cargar las encuestas. Revisa la conexión.");
    }
});

btnCancelModal.addEventListener('click', () => {
    cycleModal.classList.remove('show');
    cycleForm.reset();
});

cycleForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('nombreCiclo').value;
    const descripcion = document.getElementById('descCiclo').value;
    const idEncuesta = encuestaSelect.value;

    if (!idEncuesta) {
        alert("Por favor selecciona una encuesta.");
        return;
    }

    let fechaFinInput = document.getElementById('fechaFinCiclo');
    let fecha_fin;
    if (fechaFinInput && fechaFinInput.value) {
        try {
            fecha_fin = new Date(fechaFinInput.value).toISOString();
        } catch (e) {
            fecha_fin = null;
        }
    } else {
        fecha_fin = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    }

    const creado_por = (data && data.usuario && (data.usuario._id || data.usuario.id)) || null;

    const nuevoCiclo = {
        nombre: nombre,
        descripcion: descripcion,
        fecha_inicio: new Date().toISOString(),
        fecha_fin: fecha_fin,
        estado: 'Abierto',
        encuesta_Id: idEncuesta,
        creado_por: creado_por
    };

    const submitBtn = cycleForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Iniciando...";
    submitBtn.disabled = true;

    try {
        const response = await fetch('http://localhost:3000/ciclos-evaluacion', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${data.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(nuevoCiclo)
        });

        if (response.ok) {
            alert('¡Ciclo iniciado correctamente!');
            cycleModal.classList.remove('show');
            cycleForm.reset();
            checkCicloStatus();
        } else {
            let errorText = 'No se pudo iniciar el ciclo';
            try {
                const errorData = await response.json();
                if (errorData) {
                    if (Array.isArray(errorData.errors) && errorData.errors.length) {
                        errorText = errorData.errors.map(e => e.msg).join('\n');
                    } else if (errorData.mensaje) {
                        errorText = errorData.mensaje;
                    }
                }
            } catch (e) {
            }
            alert('Error: ' + errorText);
        }

    } catch (error) {
        console.error(error);
        alert('Error de red al iniciar ciclo');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});

window.onclick = (event) => {
    if (event.target == cycleModal) {
        cycleModal.classList.remove('show');
    }
};

if (btnGestionEncuestas) {
    btnGestionEncuestas.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
            if (addEncuestaContainer) addEncuestaContainer.style.display = 'flex';

            const encuestas = await EncuestasAPI.getAll();
            renderGestionEncuestas(encuestas);
            gestionEncuestasModal.classList.add('show');
        } catch (error) {
            console.error(error);
            alert("Error al cargar encuestas");
        }
    });
}

function renderGestionEncuestas(encuestas) {
    encuestasListContainer.innerHTML = '';

    if (encuestas.length === 0) {
        encuestasListContainer.innerHTML = '<p style="color:#666; text-align:center">No hay encuestas creadas.</p>';
    }

    encuestas.forEach(encuesta => {
        const row = document.createElement('div');
        row.className = 'encuesta-row';
        const nombre = encuesta.titulo || encuesta.nombre || `Encuesta ${encuesta._id}`;

        row.innerHTML = `
            <a href="./gestionEncuesta.html?id=${encuesta._id}&mode=view" class="encuesta-input-fake" style="text-decoration: none; color: inherit; cursor: pointer;">
                ${nombre}
            </a>
            
            <a href="./gestionEncuesta.html?id=${encuesta._id}&mode=edit" class="btn-edit-small">
                Editar
            </a>
            
            <div class="trash-icon" onclick="deleteEncuesta('${encuesta._id}')">
                <i class="fas fa-trash-alt"></i>
            </div>
        `;
        encuestasListContainer.appendChild(row);
    });
}

if (btnAddEncuesta) {
    btnAddEncuesta.addEventListener('click', () => {
        window.location.href = './gestionEncuesta.html?mode=create';
    });
}

if (btnCancelGestionEncuestas) {
    btnCancelGestionEncuestas.addEventListener('click', () => {
        gestionEncuestasModal.classList.remove('show');
    });
}

if (btnGuardarEncuestas) {
    btnGuardarEncuestas.addEventListener('click', () => {
        gestionEncuestasModal.classList.remove('show');
        const pendingRow = document.getElementById('newEncuestaRow');
        if (pendingRow) {
            pendingRow.remove();
            addEncuestaContainer.style.display = 'flex';
        }
    });
}

window.deleteEncuesta = async (id) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta encuesta? Esta acción no se puede deshacer.')) {
        try {
            const response = await fetch(`http://localhost:3000/encuestas/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${data.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                alert('Encuesta eliminada correctamente');
                const encuestas = await EncuestasAPI.getAll();
                renderGestionEncuestas(encuestas);
            } else {
                let errorText = 'No se pudo eliminar la encuesta';
                try {
                    const errorData = await response.json();
                    if (errorData && errorData.mensaje) {
                        errorText = errorData.mensaje;
                    }
                } catch (e) { }
                alert('Error: ' + errorText);
            }
        } catch (error) {
            console.error('Error eliminando encuesta:', error);
            alert('Error de conexión al eliminar la encuesta');
        }
    }
};

window.onclick = (event) => {
    if (event.target == cycleModal) cycleModal.classList.remove('show');
    if (event.target == gestionEncuestasModal) gestionEncuestasModal.classList.remove('show');
};


btnTerminar.addEventListener('click', async () => {
    const idCiclo = btnTerminar.dataset.idCiclo;
    if (!idCiclo) return;

    const confirmEnd = confirm("¿Estás seguro de que deseas terminar el ciclo actual? Ya no se podrán enviar más respuestas.");
    if (!confirmEnd) return;

    try {
        const updateData = {
            estado: 'Cerrado',
            fecha_fin: new Date().toISOString()
        };

        const response = await fetch(`http://localhost:3000/ciclos-evaluacion/${idCiclo}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${data.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });

        if (response.ok) {
            alert('Ciclo finalizado correctamente');
            checkCicloStatus();
        } else {
            alert('Error al finalizar el ciclo');
        }

    } catch (error) {
        console.error(error);
        alert('Error de red');
    }
});
