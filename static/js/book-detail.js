function checkLoginStatus() {
    return localStorage.getItem('userId') !== null;
}

function showLoginMessage() {
    alert('You must be logged in to use this feature.');
}

async function fetchBookDetails(bookId) {
    try {
        const response = await fetch(`http://localhost:8080/books/${bookId}`);
        const book = await response.json();
        return book;
    } catch (error) {
        console.error('Error fetching book details:', error);
        return null;
    }
}

function displayBookDetails(book) {
    const isLoggedIn = checkLoginStatus();
    const loanButton = isLoggedIn ? 
        `<button class="button button-primary" onclick="loanBook(${book.book_id})">Loan this book</button>` :
        `<button class="button button-primary" onclick="showLoginMessage()">Loan this book</button>`;

    const addToFavoritesButton = isLoggedIn ?
        `<button class="button button-secondary" onclick="addToFavorites(${book.book_id})">
            <i class="fa-regular fa-heart"></i> Add to favorites
        </button>` :
        `<button class="button button-secondary" onclick="showLoginMessage()">
            <i class="fa-solid fa-heart"></i> Add to favorites
        </button>`;

    const bookDetailsContainer = document.getElementById('book-details');
    
    bookDetailsContainer.innerHTML = `
        <div class="book-cover">
            <img src="${book.cover || '/static/images/placeholder-cover.png'}" 
                 alt="${book.title}"
                 onerror="this.src='/static/images/placeholder-cover.png'"
            />
        </div>
        <div class="book-info">
            <h1>${book.title}</h1>
            <p class="author">By ${book.author}</p>
            
            <div class="book-meta">
                <div>
                    <strong>Published:</strong>
                    <p>${book.publishing_year}</p>
                </div>
                <div>
                    <strong>Publisher:</strong>
                    <p>${book.publishing_company}</p>
                </div>
            </div>
            
            ${loanButton}
            ${addToFavoritesButton}
        </div>
    `;
}

async function loanBook(bookId) {
    if (!checkLoginStatus()) {
        showLoginMessage();
        return;
    }

    try {
        const userId = localStorage.getItem('userId');
        const response = await fetch(`http://localhost:8080/users/${userId}/books/${bookId}`, {
            method: 'POST'
        });

        if (response.ok) {
            alert('Book loaned successfully!');
        } else {
            const data = await response.json();
            alert(data.error || 'Error loaning book.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error loaning book.');
    }
}

async function addToFavorites(bookId) {
    if (!checkLoginStatus()) {
        showLoginMessage();
        return;
    }

    try {
        const userId = localStorage.getItem('userId');
        const response = await fetch(`http://localhost:8080/users/${userId}/favorites/${bookId}`, {
            method: 'POST'
        });

        if (response.ok) {
            alert('Book added to favorites!');
        } else {
            const data = await response.json();
            alert(data.error || 'Error adding book to favorites.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error adding book to favorites.');
    }
}

// When the page loads
document.addEventListener('DOMContentLoaded', async () => {
    // Get book ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const bookId = urlParams.get('id');

    if (bookId) {
        const book = await fetchBookDetails(bookId);
        if (book) {
            displayBookDetails(book);
        } else {
            document.getElementById('book-details').innerHTML = 
                '<p>Sorry, this book could not be found.</p>';
        }
    }
});