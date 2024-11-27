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

function createBookCard(book) {
    return `
        <div class="book-card" onclick="window.location.href='/book.htm?id=${book.book_id}'">
            <div class="book-cover">
                <img 
                    src="/static/images/placeholder-cover.png"
                    alt="${book.title}"
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
        books.forEach(book => {
            allBooksContainer.insertAdjacentHTML('beforeend', createBookCard(book));
        });
    } else {
        const initialBooks = await fetchRandomBooks(10);
        initialBooks.forEach(book => {
            allBooksContainer.insertAdjacentHTML('beforeend', createBookCard(book));
        });
    }
}

async function loadMoreBooks() {
    try {
      const moreBooks = await fetchRandomBooks(booksPerPage);
      const allBooksContainer = document.getElementById('all-books');
  
      if (moreBooks.length === 0) {
        // No more books to load, disable the button
        document.getElementById('load-more').disabled = true;
        return;
      }
  
      moreBooks.forEach(book => {
        allBooksContainer.insertAdjacentHTML('beforeend', createBookCard(book));
      });
  
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
    const searchButton = document.getElementById('search-button');

    
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

    document.getElementById('load-more').addEventListener('click', loadMoreBooks);
});