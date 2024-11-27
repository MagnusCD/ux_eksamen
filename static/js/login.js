// login.js
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('email', document.getElementById('email').value);
    formData.append('password', document.getElementById('password').value);

    try {
        const response = await fetch('http://localhost:8080/users/login', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('userId', data.user_id);
            window.location.href = '/';
        } else {
            alert(data.error || 'Invalid credentials');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error signing in');
    }
});