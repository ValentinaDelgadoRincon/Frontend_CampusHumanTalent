const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('emailInput');
const passwordInput = document.getElementById('passwordInput');
const btnLogin = document.getElementById('btnLogin');
const msgError = document.getElementById('mensaje-error'); 

const usuariosRegistrados = [
    {
        email: 'admin@campuslands.com',
        password: 'admin123',
        role: 'admin',
        nombre: 'Admin'
    },
    {
        email: 'user@campuslands.com',
        password: 'user123',
        role: 'usuario',
        nombre: 'Estudiante'
    }
];

function mostrarError(mensaje) {
    msgError.innerText = mensaje;
    msgError.style.display = 'block';

    loginForm.classList.add('shake');
    setTimeout(() => loginForm.classList.remove('shake'), 500);
}

if (loginForm && emailInput && passwordInput && btnLogin && msgError) {

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        msgError.style.display = 'none';
        msgError.innerText = '';

        const datosUsuario = {
            email: emailInput.value,
            password: passwordInput.value
        };

        const textoOriginal = btnLogin.innerText;
        btnLogin.innerText = 'Validando...';
        btnLogin.disabled = true;
        btnLogin.style.opacity = '0.7';

        try {
            const usuarioEncontrado = usuariosRegistrados.find(u =>
                u.email === datosUsuario.email &&
                u.password === datosUsuario.password
            );

            if (usuarioEncontrado) {
                console.log('Login Exitoso. Rol:', usuarioEncontrado.role);

                localStorage.setItem('user_role', usuarioEncontrado.role);
                localStorage.setItem('user_name', usuarioEncontrado.nombre);

                if (usuarioEncontrado.role === 'admin') {
                    alert(`Bienvenido ${usuarioEncontrado.nombre}. (ADMIN)`);
                    // window.location.href = '/admin-dashboard.html';
                } else {
                    alert(`Bienvenido ${usuarioEncontrado.nombre}. (USUARIO)`);
                    // window.location.href = '/home.html';
                }

            } else {
                mostrarError('Usuario o contraseña incorrectos');
            }

        } catch (error) {
            console.error("Error inesperado:", error);
            mostrarError('Ocurrió un error inesperado.');
        } finally {
            btnLogin.innerText = textoOriginal;
            btnLogin.disabled = false;
            btnLogin.style.opacity = '1';
        }
    });

} else {
    console.error("Error: Algunos elementos necesarios para el login no se encontraron en el DOM.");
}