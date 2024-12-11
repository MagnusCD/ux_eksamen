// books.js

let currentPage = 1;
const booksPerPage = 10;
const bookDetailsCache = new Map();

async function fetchRandomBooks(count = 10) {
    try {
        const response = await fetch(`http://localhost:8080/books?n=${count}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching random books:', error);
        return [];
    }
}

async function fetchBookDetails(bookId) {
    try {
        const response = await fetch(`http://localhost:8080/books/${bookId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching details for book ${bookId}:`, error);
        return null;
    }
}

function createBookCard(book) {
    return `
        <article class="book-card" 
            data-book-id="${book.book_id}"
            tabindex="0" 
            role="button"
            aria-label="View details for ${book.title} by ${book.author}"
            onclick="window.location.href='book-details.html?id=${book.book_id}'"
            onkeydown="if(event.key === 'Enter') window.location.href='book-details.html?id=${book.book_id}'">
            <div class="book-cover">
                <img 
                    src="static/images/placeholder-cover.png"
                    alt="Cover of ${book.title}"
                    onerror="this.src='static/images/placeholder-cover.png'"
                />
            </div>
            <h3>${book.title}</h3>
            <p>${book.author}</p>
        </article>
    `;
}

async function updateBookCover(book, container) {
    try {
        let cover = 'static/images/placeholder-cover.png';
        
        if (bookDetailsCache.has(book.book_id)) {
            const cachedDetails = bookDetailsCache.get(book.book_id);
            if (cachedDetails.cover?.trim()) {
                cover = cachedDetails.cover;
            }
        } else {
            const details = await fetchBookDetails(book.book_id);
            if (details?.cover?.trim()) {
                bookDetailsCache.set(book.book_id, details);
                cover = details.cover;
            }
        }

        const img = container.querySelector(`[data-book-id="${book.book_id}"] img`);
        if (img) img.src = cover;
    } catch (error) {
        console.error(`Error updating cover for book ${book.book_id}:`, error);
    }
}

async function displayBooks(books) {
    try {
        const allBooksContainer = document.getElementById('all-books');
        if (!allBooksContainer) {
            throw new Error('Books container not found');
        }

        if (!books?.length) {
            allBooksContainer.innerHTML = '<p>No books found.</p>';
            return;
        }

        const bookCards = books.map(createBookCard);
        allBooksContainer.innerHTML = bookCards.join('');

        // Update covers in parallel
        await Promise.all(books.map(book => updateBookCover(book, allBooksContainer)));
    } catch (error) {
        console.error('Error displaying books:', error);
        const container = document.getElementById('all-books');
        if (container) {
            container.innerHTML = '<p>Error loading books. Please try again later.</p>';
        }
    }
}

async function loadMoreBooks() {
    try {
        const allBooksContainer = document.getElementById('all-books');
        if (!allBooksContainer) {
            throw new Error('Books container not found');
        }

        const moreBooks = await fetchRandomBooks(booksPerPage);
        
        if (!moreBooks?.length) {
            const loadMoreButton = document.getElementById('load-more');
            if (loadMoreButton) {
                loadMoreButton.disabled = true;
            }
            return;
        }

        const displayedBookIds = new Set(
            Array.from(allBooksContainer.querySelectorAll('.book-card'))
                .map(card => Number(card.getAttribute('data-book-id')))
        );

        for (const book of moreBooks) {
            if (!displayedBookIds.has(book.book_id)) {
                allBooksContainer.insertAdjacentHTML('beforeend', createBookCard(book));
                displayedBookIds.add(book.book_id);
                await updateBookCover(book, allBooksContainer);
            }
        }

        currentPage++;
    } catch (error) {
        console.error('Error loading more books:', error);
        alert('Error loading more books. Please try again.');
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const loadMoreButton = document.getElementById('load-more');
        if (!loadMoreButton) {
            throw new Error('Load more button not found');
        }

        const initialBooks = await fetchRandomBooks(booksPerPage);
        await displayBooks(initialBooks);

        loadMoreButton.addEventListener('click', async () => {
            loadMoreButton.disabled = true;
            try {
                await loadMoreBooks();
            } finally {
                loadMoreButton.disabled = false;
            }
        });
    } catch (error) {
        console.error('Error initializing books page:', error);
    }
});