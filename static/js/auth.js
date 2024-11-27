document.addEventListener('DOMContentLoaded', checkAuth);

function checkAuth() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        window.location.href = '/login.htm';
    }
}

function logout() {
    localStorage.removeItem('userId');
    window.location.href = '/';
}