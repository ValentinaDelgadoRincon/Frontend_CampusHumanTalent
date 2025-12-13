const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('emailInput');
const passwordInput = document.getElementById('passwordInput');
const btnLogin = document.getElementById('btnLogin');
const msgError = document.getElementById('mensaje-error');

function mostrarError(mensaje) {
    msgError.innerText = mensaje;
    msgError.style.display = 'block';

    loginForm.classList.add('shake');
    setTimeout(() => loginForm.classList.remove('shake'), 500);
}

if (loginForm && emailInput && passwordInput && btnLogin && msgError) {

    loginForm.addEventListener('submit', async (e) => {
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
            const api = 'http://localhost:3000/usuarios/login';

            const response = await fetch(api, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosUsuario)
            });

            const data = await response.json();

            if (response.ok) {
                    console.log('Token:', data.token);
                    localStorage.setItem('data', JSON.stringify(data));
                    window.location.href = './views/inicioUsuario.html';
                } else {
                    mostrarError(data.message || 'Usuario o contraseña incorrectos');
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
