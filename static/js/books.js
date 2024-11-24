// Fetch functions
async function fetchRandomBooks(count = 6) {
    try {
        const response = await fetch(`http://localhost:8080/books?n=${count}`);
        const books = await response.json();
        return books;
    } catch (error) {
        console.error('Error fetching random books:', error);
        return [];
    }
}

async function fetchBookDetails(bookId) {
    try {
        const response = await fetch(`http://localhost:8080/books/${bookId}`);
        const bookDetails = await response.json();
        return bookDetails;
    } catch (error) {
        console.error('Error fetching book details:', error);
        return null;
    }
}

// Display functions
function createBookCard(book, details) {
    return `
        <div class="book-card">
            <div class="book-cover loading">
                <img 
                    src="${details?.cover || '/static/images/placeholder-cover.png'}" 
                    alt="${book.title}"
                    onerror="this.style.display='none'"
                    onload="this.parentElement.classList.remove('loading')"
                />
                <button class="heart-icon" aria-label="Add to favorites">♡</button>
            </div>
            <h3>${book.title}</h3>
            <p>${book.author}</p>
        </div>
    `;
}

async function displayBooks() {
    const tiktokBooks = await fetchRandomBooks(5);
    const newBooks = await fetchRandomBooks(5);

    const tiktokContainer = document.getElementById('tiktok-books');
    const newBooksContainer = document.getElementById('new-books');
    
    tiktokContainer.innerHTML = '';
    newBooksContainer.innerHTML = '';

    for (const book of tiktokBooks) {
        const bookDetails = await fetchBookDetails(book.book_id);
        tiktokContainer.insertAdjacentHTML('beforeend', createBookCard(book, bookDetails));
    }

    for (const book of newBooks) {
        const bookDetails = await fetchBookDetails(book.book_id);
        newBooksContainer.insertAdjacentHTML('beforeend', createBookCard(book, bookDetails));
    }
}

document.addEventListener('DOMContentLoaded', displayBooks);