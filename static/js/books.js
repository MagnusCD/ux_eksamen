// books.js
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

let currentPage = 1;
const booksPerPage = 10;

async function fetchRandomBooks(count = 10) {
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
        return await response.json();
    } catch (error) {
        console.error('Error fetching book details:', error);
        return null;
    }
}

async function createBookCard(book) {
    // Fetch book details to get the cover
    const bookDetails = await fetchBookDetails(book.book_id);
    const coverUrl = bookDetails?.cover || '/static/images/placeholder-cover.png';

    return `
        <div class="book-card" 
             tabindex="0" 
             role="button"
             aria-label="View details for ${book.title} by ${book.author}"
             onclick="window.location.href='/book.htm?id=${book.book_id}'"
             onkeydown="if(event.key === 'Enter') window.location.href='/book.htm?id=${book.book_id}'">
            <div class="book-cover">
                <img 
                    src="${coverUrl}"
                    alt="Cover of ${book.title}"
                    onerror="this.src='/static/images/placeholder-cover.png'"
                />
            </div>
            <h3>${book.title}</h3>
            <p>${book.author}</p>
        </div>
    `;
}

async function searchBooks(searchTerm) {
    try {
        const response = await fetch(`http://localhost:8080/books?s=${searchTerm}`);
        const books = await response.json();
        return books;
    } catch (error) {
        console.error('Error searching books:', error);
        return [];
    }
}

async function displayBooks(books) {
    const allBooksContainer = document.getElementById('all-books');
    allBooksContainer.innerHTML = '';

    if (Array.isArray(books)) {
        for (const book of books) {
            const bookCard = await createBookCard(book);
            allBooksContainer.insertAdjacentHTML('beforeend', bookCard);
        }
    } else {
        const initialBooks = await fetchRandomBooks(10);
        for (const book of initialBooks) {
            const bookCard = await createBookCard(book);
            allBooksContainer.insertAdjacentHTML('beforeend', bookCard);
        }
    }
}

async function loadMoreBooks() {
    try {
        const moreBooks = await fetchRandomBooks(booksPerPage);
        const allBooksContainer = document.getElementById('all-books');

        if (moreBooks.length === 0) {
            document.getElementById('load-more').disabled = true;
            return;
        }

        for (const book of moreBooks) {
            const bookCard = await createBookCard(book);
            allBooksContainer.insertAdjacentHTML('beforeend', bookCard);
        }

        currentPage++;
    } catch (error) {
        console.error('Error loading more books:', error);
        alert('An error occurred while loading more books.');
    }
}

document.getElementById('load-more').addEventListener('click', async () => {
  document.getElementById('load-more').disabled = true;
  try {
    await loadMoreBooks();
  } finally {
    document.getElementById('load-more').disabled = false;
  }
});

document.addEventListener('DOMContentLoaded', async () => {
    await displayBooks();

    const searchInput = document.getElementById('search-input');
  

    
    const performSearch = debounce(async (value) => {
        if (value === '') {
            const initialBooks = await fetchRandomBooks(10);
            displayBooks(initialBooks);
        } else {
            const searchResults = await searchBooks(value);
            displayBooks(searchResults);
        }
    }, 300); // 300ms delay

    searchInput.addEventListener('input', async (e) => {
        performSearch(e.target.value.trim());
    });
});