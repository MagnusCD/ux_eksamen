// author.js
const bookDetailsCache = new Map();

async function getBookCover(bookId) {
    if (bookDetailsCache.has(bookId)) {
        return bookDetailsCache.get(bookId).cover;
    }

    try {
        const response = await fetch(`http://localhost:8080/books/${bookId}`);
        const bookDetails = await response.json();
        bookDetailsCache.set(bookId, bookDetails);
        return bookDetails.cover || 'static/images/placeholder-cover.png';
    } catch (error) {
        console.error(`Error fetching details for book ${bookId}:`, error);
        return 'static/images/placeholder-cover.png';
    }
}

async function displayAuthorBooks(books, authorName) {
    document.getElementById('author-name').textContent = `Books by ${authorName}`;
    const bookList = document.getElementById('book-list');

    // Vis skeleton loading
    bookList.innerHTML = '<div class="book-card book-card-skeleton"></div>'.repeat(5);

    if (books.length > 0) {
        const bookCards = await Promise.all(
            books.map(async (book) => {
                const coverUrl = await getBookCover(book.book_id);
                return `
                    <div class="book-card" onclick="window.location.href='/book-details.html?id=${book.book_id}'">
                        <div class="book-cover">
                            <img src="${coverUrl}"
                                 alt="${book.title}"
                                 onerror="this.src='static/images/placeholder-cover.png'"
                            />
                        </div>
                        <h3>${book.title}</h3>
                        <p>${book.author}</p>
                    </div>
                `;
            })
        );

        bookList.innerHTML = bookCards.join('');
    } else {
        bookList.innerHTML = '<p>No books found for this author.</p>';
    }
}

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
    await displayAuthorBooks(books, author.author_name);
}

document.addEventListener('DOMContentLoaded', initializeAuthorPage);