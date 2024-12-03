// book-detail.js
function checkLoginStatus() {
    return localStorage.getItem('userId') !== null;
}

function showLoginMessage() {
    alert('You must be logged in to use this feature.');
}

async function fetchBookDetails(bookId) {
    try {
        const response = await fetch(`http://localhost:8080/books/${bookId}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching book details:', error);
        return null;
    }
}

async function fetchBookDetailsForAdmin(bookId) {
    try {
        const response = await fetch(`http://localhost:8080/admin/books/${bookId}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching book details:', error);
        return null;
    }
}

async function findAuthorId(authorName) {
    try {
        const response = await fetch('http://localhost:8080/authors');
        const authors = await response.json();
        const author = authors.find(a => a.author_name === authorName);
        return author ? author.author_id : null;
    } catch (error) {
        console.error('Error fetching author ID:', error);
        return null;
    }
}

async function displayBookDetails(book, bookId) {
    const isLoggedIn = checkLoginStatus();
    const isAdmin = localStorage.getItem('userRole') === 'admin';

    const loanButton = isLoggedIn 
        ? `<button class="button button-primary" onclick="loanBook(${bookId})">Loan this book</button>`
        : `<button class="button button-primary" onclick="showLoginMessage()">Loan this book</button>`;

    const addToFavoritesButton = isLoggedIn
        ? `<button class="button button-secondary" onclick="addToFavorites(${bookId})"><i class="fa-regular fa-heart"></i> Add to favorites</button>`
        : `<button class="button button-secondary" onclick="showLoginMessage()"><i class="fa-regular fa-heart"></i> Add to favorites</button>`;

    const authorElement = await createAuthorLink(book);

    const bookDetailsContainer = document.getElementById('book-details');
    bookDetailsContainer.innerHTML = `
        <div class="book-cover"><img src="${book.cover || '/static/images/placeholder-cover.png'}" alt="${book.title}" onerror="this.src='/static/images/placeholder-cover.png'"></div>
        <div class="book-info">
            <h1>${book.title}</h1>
            <p class="author">By ${authorElement.outerHTML}</p>
            <div class="book-meta">
                <div><strong>Published:</strong><p>${book.publishing_year}</p></div>
                <div><strong>Publisher:</strong><p>${book.publishing_company}</p></div>
            </div>
            <div class="button-group">${loanButton}${addToFavoritesButton}</div>
        </div>
    `;

    if (isAdmin) {
        const bookDetails = await fetchBookDetailsForAdmin(bookId);
        if (bookDetails) {
            let loanHistoryHTML = '';
            if (bookDetails.loans.length > 0) {
                loanHistoryHTML = `
                    <div class="loan-history">
                        <h2>Loan History</h2>
                        <ul>${bookDetails.loans.reverse().map(loan => `<li>User ID: ${loan.user_id}, Loan Date: ${loan.loan_date}</li>`).join('')}</ul>
                    </div>
                `;
            } else {
                loanHistoryHTML = `
                    <div class="loan-history">
                        <h2>Loan History</h2>
                        <p>No loans for this book.</p>
                    </div>
                `;
            }
            bookDetailsContainer.innerHTML += loanHistoryHTML;
        }
    }
}

async function createAuthorLink(book) {
    const authorId = await findAuthorId(book.author);
    const authorElement = document.createElement('a');
    authorElement.classList.add('author');
    authorElement.textContent = book.author;
    if (authorId) {
        authorElement.href = `/author.htm?a=${authorId}`;
        authorElement.addEventListener('click', (event) => {
            event.preventDefault();
            window.location.href = authorElement.href;
        });
    }
    return authorElement;
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
            alert('Book loaned successfully!\nAn email will be sent with a link to access the e-book. You can loan this book for 30 days.');
        } else {
            const data = await response.json();
            if (data.error === "This user has still this book on loan") {
                alert("You already have this book on loan. You can only loan the same book again after 30 days.");
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
    icon.classList.toggle('fa-regular');
    icon.classList.toggle('fa-solid');

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
            await displayBookDetails(book, bookId);
        } else {
            document.getElementById('book-details').innerHTML = '<p>Sorry, this book could not be found.</p>';
        }
    }
});