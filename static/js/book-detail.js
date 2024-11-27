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

function displayBookDetails(book, bookId) {
    const isLoggedIn = checkLoginStatus();
    const loanButton = isLoggedIn ? 
        `<button class="button button-primary" onclick="loanBook(${bookId})">Loan this book</button>` :
        `<button class="button button-primary" onclick="showLoginMessage()">Loan this book</button>`;

    const addToFavoritesButton = isLoggedIn ?
        `<button class="button button-secondary" onclick="addToFavorites(${bookId})">
            <i class="fa-regular fa-heart"></i> Add to favorites
        </button>` :
        `<button class="button button-secondary" onclick="showLoginMessage()">
            <i class="fa-regular fa-heart"></i> Add to favorites
        </button>`;

    const authorElement = document.createElement('a');
    authorElement.classList.add('author');
    authorElement.textContent = book.author;
    authorElement.href = `/author.htm?name=${encodeURIComponent(book.author)}`;
    authorElement.addEventListener('click', (event) => {
        event.preventDefault();
        window.location.href = authorElement.href;
    });

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
            <p class="author">By ${authorElement.outerHTML}</p>
            
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
            
            <div class="button-group">
                ${loanButton}
                ${addToFavoritesButton}
            </div>
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
            // Display a more detailed success message
            const message = 
                'Book loaned successfully!\n\n' +
                'An email will be sent to your registered email address with a link to access the e-book.\n' +
                'You can loan this book for 30 days.';
            alert(message);
        } else {
            const data = await response.json();
            if (data.error === "This user has still this book on loan") {
                alert("You already have this book on loan. You can only loan the same book again after 30 days from the previous loan.");
            } else {
                alert(data.error || 'Error loaning book.');
            }
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

    const button = event.target.closest('button');
    const icon = button.querySelector('i');
    
    // Toggle heart icon
    icon.classList.toggle('fa-regular');
    icon.classList.toggle('fa-solid');

    // Here, we would normally make an API call to save the favorite
    // Since the API doesn't have a favorites endpoint, we're storing it in localStorage
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const index = favorites.indexOf(bookId);
    
    if (index === -1) {
        favorites.push(bookId);
        alert('Book added to favorites!');
    } else {
        favorites.splice(index, 1);
        alert('Book removed from favorites!');
    }
    
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const bookId = urlParams.get('id');

    if (bookId) {
        const book = await fetchBookDetails(bookId);
        if (book) {
            displayBookDetails(book, bookId);
        } else {
            document.getElementById('book-details').innerHTML = 
                '<p>Sorry, this book could not be found.</p>';
        }
    }
});