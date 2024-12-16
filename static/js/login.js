"use strict"

// login.js

function validateEmail(email) {
    return email && email.includes('@') && email.includes('.');
}

function setUserSession(email, userId, isAdmin) {
    sessionStorage.setItem('userEmail', email);
    sessionStorage.setItem('userId', userId);
    if (isAdmin) {
        sessionStorage.setItem('userRole', 'admin');
    }
}

async function handleLogin(formData) {
    try {
        const response = await fetch('http://localhost:8080/users/login', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Invalid credentials');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    
    if (!loginForm) {
        console.error('Login form not found');
        return;
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');

        if (!emailInput || !passwordInput) {
            alert('Form inputs not found');
            return;
        }

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        // Basic validation
        if (!validateEmail(email)) {
            alert('Please enter a valid email address');
            return;
        }

        if (!password) {
            alert('Please enter your password');
            return;
        }

        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);

        try {
            const data = await handleLogin(formData);
            
            // Check admin status
            const isAdmin = email === 'admin.library@mail.com';
            setUserSession(email, data.user_id, isAdmin);
            
            // Redirect based on role
            window.location.href = isAdmin ? 'admin.html' : 'index.html';
        } catch (error) {
            alert(error.message || 'Error signing in');
        }
    });
});