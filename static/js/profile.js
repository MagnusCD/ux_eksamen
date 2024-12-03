// profile.js
function checkAuth() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        window.location.href = '/login.htm';
        return null;
    }
    return userId;
}

async function fetchUserProfile() {
    const userId = checkAuth();
    if (!userId) return;

    try {
        const response = await fetch(`http://localhost:8080/users/${userId}`);
        const userData = await response.json();
        return userData;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return null;
    }
}

function displayUserProfile(userData) {
    document.getElementById('first_name').value = userData.first_name;
    document.getElementById('last_name').value = userData.last_name;
    document.getElementById('email').value = userData.email;
    document.getElementById('address').value = userData.address;
    document.getElementById('phone_number').value = userData.phone_number;
    document.getElementById('birth_date').value = userData.birth_date;
    document.getElementById('membership_date').value = new Date(userData.membership_date).toLocaleDateString();
}

async function handleProfileUpdate(event) {
    event.preventDefault();
    const userId = checkAuth();
    if (!userId) return;

    const formData = new FormData(event.target);
    
    try {
        const response = await fetch(`http://localhost:8080/users/${userId}`, {
            method: 'PUT',
            body: formData
        });

        if (response.ok) {
            alert('Profile updated successfully!');
        } else {
            const data = await response.json();
            alert(data.error || 'Error updating profile');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error updating profile');
    }
}

async function handleDeleteAccount() {
    const userId = checkAuth();
    if (!userId) return;

    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        try {
            const response = await fetch(`http://localhost:8080/users/${userId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                localStorage.removeItem('userId');
                window.location.href = '/';
            } else {
                const data = await response.json();
                alert(data.error || 'Error deleting account');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error deleting account');
        }
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const userId = checkAuth();
    if (!userId) return;

    const userData = await fetchUserProfile();
    if (userData) {
        displayUserProfile(userData);
    }

    document.getElementById('profile-form').addEventListener('submit', handleProfileUpdate);
    document.getElementById('delete-account').addEventListener('click', handleDeleteAccount);
});