document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const authorId = urlParams.get('a');

    if (authorId) {
        const author = await fetchAuthorById(authorId);
        if (author) {
            document.getElementById('author-name').textContent = `Books by ${author.author_name}`;

            const bookList = document.getElementById('book-list');
            const books = await fetchBooksByAuthor(authorId);

            if (books.length > 0) {
                books.forEach(book => {
                    const bookElement = document.createElement('div');
                    bookElement.classList.add('book-item');
                    bookElement.innerHTML = `
                        <div class="book-cover">
                            <a href="/book.html?id=${book.book_id}">
                                <img src="${book.cover || '/static/images/placeholder-cover.png'}"
                                     alt="${book.title}"
                                     onerror="this.src='/static/images/placeholder-cover.png'">
                            </a>
                        </div>
                        <div class="book-info">
                            <h3><a href="/book.html?id=${book.book_id}">${book.title}</a></h3>
                            <p class="author">By ${book.author}</p>
                        </div>
                    `;
                    bookList.appendChild(bookElement);
                });
            } else {
                bookList.innerHTML = '<p>No books found for this author.</p>';
            }
        } else {
            bookList.innerHTML = '<p>The requested author could not be found.</p>';
        }
    } else {
        bookList.innerHTML = '<p>No author ID provided in the URL.</p>';
    }
});

async function fetchAuthorById(authorId) {
    try {
        const response = await fetch(`http://localhost:8080/authors?a=${authorId}`);
        const author = await response.json();
        return author;
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