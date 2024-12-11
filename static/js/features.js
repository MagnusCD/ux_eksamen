// features.js
// Debounce utility function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Search functionality
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const performSearch = debounce(async (value) => {
        if (value === '') {
            await displayBooks(await fetchRandomBooks(10));
        } else {
            const searchResults = await fetch(`http://localhost:8080/books?s=${value}`)
                .then(response => response.json())
                .then(books => books.filter(book => book.title.toLowerCase().includes(value.toLowerCase())));
            await displayBooks(searchResults);
        }
    }, 300);
    
    searchInput.addEventListener('input', async (e) => {
        performSearch(e.target.value.trim());
    });
});

// Back to top functionality
const backToTopBtn = document.getElementById('back-to-top');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        backToTopBtn.style.display = 'block';
    } else {
        backToTopBtn.style.display = 'none';
    }
});

backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});
