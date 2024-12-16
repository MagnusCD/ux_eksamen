"use strict"

// Auth check
function checkAuth() {
    const userId = sessionStorage.getItem('userId');
    if (!userId) {
        window.location.href = 'login.html';
        return null;
    }
    return userId;
}

// API calls
async function fetchUserProfile(userId) {
    try {
        const response = await fetch(`http://localhost:8080/users/${userId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching user profile:', error);
        alert('Failed to load profile data. Please try again.');
        return null;
    }
}

// Display functions
function displayUserProfile(userData) {
    try {
        const fields = [
            'first_name', 'last_name', 'email', 
            'address', 'phone_number', 'birth_date'
        ];

        fields.forEach(field => {
            const element = document.getElementById(field);
            if (element) {
                element.value = userData[field] || '';
            }
        });

        const membershipDate = document.getElementById('membership_date');
        if (membershipDate && userData.membership_date) {
            membershipDate.value = new Date(userData.membership_date).toLocaleDateString();
        }
    } catch (error) {
        console.error('Error displaying user profile:', error);
        alert('Error displaying profile information');
    }
}

// Form handlers
async function handleProfileUpdate(event) {
    event.preventDefault();
    const userId = checkAuth();
    if (!userId) return;

    try {
        const formData = new FormData(event.target);
        
        const response = await fetch(`http://localhost:8080/users/${userId}`, {
            method: 'PUT',
            body: formData
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to update profile');
        }

        alert('Profile updated successfully!');
        
        // Refresh profile data
        const updatedData = await fetchUserProfile(userId);
        if (updatedData) {
            displayUserProfile(updatedData);
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        alert(error.message || 'Error updating profile');
    }
}

async function handleDeleteAccount() {
    const userId = checkAuth();
    if (!userId) return;

    try {
        if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            return;
        }

        const response = await fetch(`http://localhost:8080/users/${userId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to delete account');
        }

        sessionStorage.clear(); // Clear all session data
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Error deleting account:', error);
        alert(error.message || 'Error deleting account');
    }
}

// Initialize
async function initializeProfile() {
    try {
        const userId = checkAuth();
        if (!userId) return;

        const profileForm = document.getElementById('profile-form');
        const deleteButton = document.getElementById('delete-account');

        if (!profileForm || !deleteButton) {
            throw new Error('Required elements not found');
        }

        const userData = await fetchUserProfile(userId);
        if (userData) {
            displayUserProfile(userData);
        }

        profileForm.addEventListener('submit', handleProfileUpdate);
        deleteButton.addEventListener('click', handleDeleteAccount);
    } catch (error) {
        console.error('Error initializing profile:', error);
        alert('Error loading profile page');
    }
}

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', initializeProfile);