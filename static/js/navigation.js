function initializeBurgerMenu() {
    const burgerMenu = document.querySelector('.burger-menu');
    const nav = document.querySelector('.nav-right');
    
    if (burgerMenu && nav) {
        burgerMenu.addEventListener('click', () => {
            nav.classList.toggle('active');
            
            const spans = burgerMenu.querySelectorAll('span');
            spans.forEach(span => span.classList.toggle('active'));
        });

        document.addEventListener('click', (e) => {
            if (!nav.contains(e.target) && !burgerMenu.contains(e.target)) {
                nav.classList.remove('active');
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', initializeBurgerMenu);