document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    
    try {
        const response = await fetch('http://localhost:8080/users', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            console.log('User created with ID:', data.user_id);
            alert('Account created successfully!');
            window.location.href = '/login.htm';
        } else {
            alert(data.error || 'Error creating account');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error creating account');
    }
});