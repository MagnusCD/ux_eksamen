const bookDetailsCache = new Map();

async function displayAuthorBooks(books, authorName) {
    document.getElementById('author-name').textContent = `Books by ${authorName}`;
    const bookList = document.getElementById('book-list');

    if (books.length > 0) {
        // Først vis alle bøger med placeholder billeder
        const bookCards = books.map(book => `
            <div class="book-card" 
                data-book-id="${book.book_id}"
                onclick="window.location.href='/book-details.html?id=${book.book_id}'">
                <div class="book-cover">
                    <img src="static/images/placeholder-cover.png"
                         alt="${book.title}"
                         onerror="this.src='static/images/placeholder-cover.png'"
                    />
                </div>
                <h3>${book.title}</h3>
                <p>${book.author}</p>
            </div>
        `);

        bookList.innerHTML = bookCards.join('');

        // Derefter hent og opdater covers
        for (const book of books) {
            let cover = 'static/images/placeholder-cover.png';
            if (bookDetailsCache.has(book.book_id)) {
                const cachedDetails = bookDetailsCache.get(book.book_id);
                if (cachedDetails.cover && cachedDetails.cover.trim() !== '') {
                    cover = cachedDetails.cover;
                }
            } else {
                try {
                    const response = await fetch(`http://localhost:8080/books/${book.book_id}`);
                    const details = await response.json();
                    if (details.cover && details.cover.trim() !== '') {
                        bookDetailsCache.set(book.book_id, details);
                        cover = details.cover;
                    }
                } catch (error) {
                    console.error(`Error fetching details for book ${book.book_id}:`, error);
                }
            }
            const img = bookList.querySelector(`[data-book-id="${book.book_id}"] img`);
            if (img) img.src = cover;
        }
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