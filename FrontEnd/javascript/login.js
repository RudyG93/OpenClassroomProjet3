const loginForm = document.querySelector('.login-form');

function displayLoginError(message) {
  let errorElement = document.querySelector('.login-error');

  if (!errorElement) {
    errorElement = document.createElement('p');
    errorElement.classList.add('login-error');
    loginForm.appendChild(errorElement);
  }

  errorElement.textContent = message;
  errorElement.style.color = '#B1663C';
  errorElement.style.textAlign = 'center';
  errorElement.style.marginTop = '10px';
}

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;

    const userData = {
        email: email,
        password: password
    };

    try {
        const response = await fetch('http://localhost:5678/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            throw new Error('Identifiants incorrects');
        }

        const data = await response.json();
        localStorage.setItem('token', data.token);

        window.location.href = 'index.html';
    } catch (error) {
        displayLoginError(error.message);
    }
});
