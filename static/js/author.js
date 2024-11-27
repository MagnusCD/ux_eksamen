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

function displayAuthorBooks(books, authorName) {
    document.getElementById('author-name').textContent = `Books by ${authorName}`;
    const bookList = document.getElementById('book-list');
    
    if (books.length > 0) {
        books.forEach(book => {
            bookList.insertAdjacentHTML('beforeend', `
                <div class="book-card" onclick="window.location.href='/book.htm?id=${book.book_id}'">
                    <div class="book-cover">
                        <img src="${book.cover || '/static/images/placeholder-cover.png'}"
                             alt="${book.title}"
                             onerror="this.src='/static/images/placeholder-cover.png'"
                        />
                    </div>
                    <h3>${book.title}</h3>
                    <p>${book.author}</p>
                </div>
            `);
        });
    } else {
        bookList.innerHTML = '<p>No books found for this author.</p>';
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
    displayAuthorBooks(books, author.author_name);
}

document.addEventListener('DOMContentLoaded', initializeAuthorPage);