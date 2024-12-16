"use strict"

// features.js

// Constants
const DEBOUNCE_DELAY = 300;
const SCROLL_THRESHOLD = 300;
const RANDOM_BOOKS_COUNT = 10;

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
async function searchBooks(value) {
    try {
        if (!value) {
            const randomBooks = await fetchRandomBooks(RANDOM_BOOKS_COUNT);
            await displayBooks(randomBooks);
            return;
        }

        const response = await fetch(`http://localhost:8080/books?s=${value}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const books = await response.json();
        const searchResults = books.filter(book => 
            book.title.toLowerCase().includes(value.toLowerCase())
        );
        
        await displayBooks(searchResults);
    } catch (error) {
        console.error('Error performing search:', error);
        const booksContainer = document.getElementById('all-books');
        if (booksContainer) {
            booksContainer.innerHTML = '<p>Error performing search. Please try again.</p>';
        }
    }
}

// Back to top functionality
function setupBackToTop() {
    const backToTopBtn = document.getElementById('back-to-top');
    if (!backToTopBtn) return;

    function updateBackToTopVisibility() {
        backToTopBtn.style.display = 
            window.pageYOffset > SCROLL_THRESHOLD ? 'block' : 'none';
    }

    window.addEventListener('scroll', updateBackToTopVisibility);

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Initialize features
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Setup search
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            const performSearch = debounce(searchBooks, DEBOUNCE_DELAY);
            searchInput.addEventListener('input', (e) => {
                performSearch(e.target.value.trim());
            });
        }

        // Setup back to top
        setupBackToTop();
    } catch (error) {
        console.error('Error initializing features:', error);
    }
});