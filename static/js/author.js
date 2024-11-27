// Fetch functions
async function fetchAuthorById(authorId) {
    try {
        const response = await fetch(`http://localhost:8080/authors`);
        const authors = await response.json();
        return authors.find(author => author.author_id === parseInt(authorId));
    } catch (error) {
        console.error('Error fetching author:', error);
        return null;
    }
}

async function fetchBooksByAuthor(authorId) {
    try {
        const response = await fetch(`http://localhost:8080/books?a=${authorId}`);
        const books = await response.json();
        return books;
    } catch (error) {
        console.error('Error fetching books:', error);
        return [];
    }
}

// Display functions
function displayAuthorBooks(books, authorName) {
    const bookList = document.getElementById('book-list');
    document.getElementById('author-name').textContent = `Books by ${authorName}`;

    if (books.length > 0) {
        books.forEach(book => {
            const bookElement = document.createElement('div');
            bookElement.classList.add('book-item');
            bookElement.innerHTML = `
                <div class="book-cover">
                    <a href="/book.htm?id=${book.book_id}">
                        <img src="${book.cover || '/static/images/placeholder-cover.png'}"
                             alt="${book.title}"
                             onerror="this.src='/static/images/placeholder-cover.png'">
                    </a>
                </div>
                <div class="book-info">
                    <h3><a href="/book.htm?id=${book.book_id}">${book.title}</a></h3>
                    <p class="publishing-year">${book.publishing_year}</p>
                </div>
            `;
            bookList.appendChild(bookElement);
        });
    } else {
        bookList.innerHTML = '<p>No books found for this author.</p>';
    }
}

// Initialize page
async function initializeAuthorPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const authorId = urlParams.get('a');

    if (!authorId) {
        document.getElementById('book-list').innerHTML = '<p>No author ID provided in the URL.</p>';
        return;
    }

    const author = await fetchAuthorById(authorId);
    if (!author) {
        document.getElementById('book-list').innerHTML = '<p>The requested author could not be found.</p>';
        return;
    }

    const books = await fetchBooksByAuthor(authorId);
    displayAuthorBooks(books, author.author_name);
}

// Start when page loads
document.addEventListener('DOMContentLoaded', initializeAuthorPage);