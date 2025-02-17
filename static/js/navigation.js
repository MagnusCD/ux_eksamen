"use strict"

function checkAuth() {
    return sessionStorage.getItem('userEmail') !== null;
}
// Navigation initialization
function initializeNavigation() {
    const navGuest = document.getElementById('nav-guest-menu');
    const navAuthenticated = document.getElementById('nav-authenticated-menu');
    const burgerMenu = document.querySelector('.burger-menu');
    const navRight = document.querySelector('.nav-right');

    // Set initial menu visibility based on auth status
    if (checkAuth()) {
        navGuest.style.display = 'none';
        navAuthenticated.style.display = 'flex';
    } else {
        navGuest.style.display = 'flex';
        navAuthenticated.style.display = 'none';
    }

    // Burger menu click handler
    if (burgerMenu && navRight) {
        burgerMenu.addEventListener('click', (e) => {
            e.stopPropagation();
            burgerMenu.classList.toggle('active');
            
            document.querySelectorAll('.nav-right').forEach(nav => {
                if (nav.style.display !== 'none') {
                    nav.classList.toggle('active');
                }
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            const navMenus = document.querySelectorAll('.nav-right');
            if (!navMenus[0].contains(e.target) && 
                !navMenus[1].contains(e.target) && 
                !burgerMenu.contains(e.target)) {
                burgerMenu.classList.remove('active');
                navMenus.forEach(nav => nav.classList.remove('active'));
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Find logout knappen med den korrekte class
    const logoutButton = document.querySelector('.logout');
    
    if (logoutButton) {
        logoutButton.addEventListener('click', logoutUser);
    }
});

// Logout function
function logoutUser() {
    sessionStorage.removeItem('userEmail');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('userRole');
    window.location.href = 'index.html';
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeNavigation();
});