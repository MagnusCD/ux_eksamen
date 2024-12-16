"use strict"

document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');
    
    if (!signupForm) {
        console.error('Signup form not found');
        return;
    }

    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        
        // Get form values
        const email = formData.get('email')?.trim();
        const password = formData.get('password');
        const confirmPassword = formData.get('confirm_password');
        const firstName = formData.get('first_name')?.trim(); 
        const lastName = formData.get('last_name')?.trim();
        
        // Validate required fields
        if (!email || !firstName || !lastName || !password || !confirmPassword) {
            alert('Please fill in all required fields');
            return;
        }

        // Validate email format
        if (!email.includes('@') || !email.includes('.')) {
            alert('Please enter a valid email address');
            return;
        }

        // Validate password length
        if (password.length < 8) {
            alert('Password must be at least 8 characters long');
            return;
        }

        // Check passwords match
        if (password !== confirmPassword) {
            alert('Passwords do not match. Please try again.');
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/users', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to create account');
            }

            const data = await response.json();
            console.log('User created with ID:', data.user_id);
            alert('Account created successfully!');
            window.location.href = 'login.html';
        } catch (error) {
            console.error('Error:', error);
            alert(error.message || 'Error creating account');
        }
    });
});