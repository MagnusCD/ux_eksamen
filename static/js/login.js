document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData();
    const email = document.getElementById('email').value;
    formData.append('email', email);
    formData.append('password', document.getElementById('password').value);

    try {
        const response = await fetch('http://localhost:8080/users/login', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            sessionStorage.setItem('userEmail', email);
            sessionStorage.setItem('userId', data.user_id);
            
            // Check if admin
            if (email === 'admin.library@mail.com') {
                sessionStorage.setItem('userRole', 'admin');
                window.location.href = '/admin.html'; 
            } else {
                window.location.href = '/'; 
            }
        } else {
            alert(data.error || 'Invalid credentials');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error signing in');
    }
});