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
const bookDetailsCache = new Map();

async function fetchWithRetry(url, maxRetries = 3, delay = 1000) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            return data;
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

async function fetchRandomBooks(count = 10) {
    try {
        const books = await fetchWithRetry(`http://localhost:8080/books?n=${count}`);
        
        const booksWithDetails = await Promise.all(
            books.map(async (book) => {
                try {
                    if (bookDetailsCache.has(book.book_id)) {
                        const cachedDetails = bookDetailsCache.get(book.book_id);
                        return { ...book, cover: cachedDetails.cover && cachedDetails.cover.trim() !== '' ? cachedDetails.cover : 'static/images/placeholder-cover.png' };
                    }

                    const details = await fetchWithRetry(`http://localhost:8080/books/${book.book_id}`);
                    if (details && details.cover && details.cover.trim() !== '') {
                        console.log(`Successfully fetched cover for: ${book.title}`, {
                            coverUrl: details.cover,
                            fullDetails: details
                        });
                        bookDetailsCache.set(book.book_id, details);
                        return { ...book, cover: details.cover };
                    }
                } catch (error) {
                    console.error(`Failed to fetch details for book ${book.book_id}:`, error);
                }
                return { ...book, cover: 'static/images/placeholder-cover.png' };
            })
        );

        return booksWithDetails;
    } catch (error) {
        console.error('Error fetching random books:', error);
        return [];
    }
}

async function createBookCard(book) {
    const coverUrl = (book.cover && book.cover.trim() !== '') 
        ? book.cover 
        : 'static/images/placeholder-cover.png';
        
    console.log(`Creating card for "${book.title}":`, {
        providedCover: book.cover,
        usingCoverUrl: coverUrl
    });

    return `
        <article class="book-card" 
            data-book-id="${book.book_id}"
            tabindex="0" 
            role="button"
            aria-label="View details for ${book.title} by ${book.author}"
            onclick="window.location.href='/book-details.html?id=${book.book_id}'"
            onkeydown="if(event.key === 'Enter') window.location.href='/book-details.html?id=${book.book_id}'">
            <div class="book-cover">
                <img 
                    src="${coverUrl}"
                    alt="Cover of ${book.title}"
                    onerror="this.src='static/images/placeholder-cover.png'"
                />
            </div>
            <h3>${book.title}</h3>
            <p>${book.author}</p>
        </article>
    `;
}

async function searchBooks(searchTerm) {
    try {
        const response = await fetchWithRetry(`http://localhost:8080/books?s=${searchTerm}`);
        return response.filter(book => 
            book.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
    } catch (error) {
        console.error('Error searching books:', error);
        return [];
    }
}

async function displayBooks(books) {
    const allBooksContainer = document.getElementById('all-books');
    allBooksContainer.innerHTML = '';

    // Show a loading indicator
    allBooksContainer.innerHTML = '<div class="book-card book-card-skeleton"></div>'.repeat(10);

    const displayedBookIds = new Set();

    if (Array.isArray(books)) {
        const bookCards = await Promise.all(
            books.map(async (book) => {
                if (!displayedBookIds.has(book.book_id)) {
                    const bookCard = await createBookCard(book);
                    displayedBookIds.add(book.book_id);
                    return bookCard;
                }
            })
        );

        allBooksContainer.innerHTML = bookCards.filter(Boolean).join('');
    } else {
        const initialBooks = await fetchRandomBooks(10);
        const initialBookCards = await Promise.all(
            initialBooks.map(async (book) => {
                if (!displayedBookIds.has(book.book_id)) {
                    const bookCard = await createBookCard(book);
                    displayedBookIds.add(book.book_id);
                    return bookCard;
                }
            })
        );

        allBooksContainer.innerHTML = initialBookCards.filter(Boolean).join('');
    }
}

async function retryDisplayBooks(maxAttempts = 3, delay = 2000) {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const booksContainer = document.getElementById('all-books');
        const hasBooks = booksContainer && booksContainer.querySelector('.book-card:not(.book-card-skeleton)');
        
        if (!hasBooks) {
            console.log(`Attempt ${attempt + 1}: Retrying to load books...`);
            await displayBooks();
            if (!hasBooks) {
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                break;
            }
        } else {
            break;
        }
    }
}

async function loadMoreBooks() {
    try {
        // Add skeleton loaders
        const allBooksContainer = document.getElementById('all-books');
        allBooksContainer.insertAdjacentHTML('beforeend', 
            '<div class="book-card book-card-skeleton"></div>'.repeat(booksPerPage)
        );

        const moreBooks = await fetchRandomBooks(booksPerPage);
        
        // Remove skeleton loaders
        const skeletons = allBooksContainer.querySelectorAll('.book-card-skeleton');
        skeletons.forEach(skeleton => skeleton.remove());
        
        const displayedBookIds = new Set(
            Array.from(allBooksContainer.querySelectorAll('.book-card'))
                .map(card => Number(card.getAttribute('data-book-id')))
        );

        if (moreBooks.length === 0) {
            document.getElementById('load-more').disabled = true;
            return;
        }

        for (const book of moreBooks) {
            if (!displayedBookIds.has(book.book_id)) {
                const bookCard = await createBookCard(book);
                allBooksContainer.insertAdjacentHTML('beforeend', bookCard);
                displayedBookIds.add(book.book_id);
            }
        }

        currentPage++;
    } catch (error) {
        console.error('Error loading more books:', error);
        // Remove skeleton loaders if there's an error
        const skeletons = document.querySelectorAll('.book-card-skeleton');
        skeletons.forEach(skeleton => skeleton.remove());
        
        // Retry loading more books
        await retryDisplayBooks(3, 2000);
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
    // Initial display attempt
    await displayBooks();

    // Start retry mechanism
    setTimeout(() => {
        const booksContainer = document.getElementById('all-books');
        const hasBooks = booksContainer && booksContainer.querySelector('.book-card:not(.book-card-skeleton)');
        
        if (!hasBooks) {
            retryDisplayBooks();
        }
    }, 3000); // Check after 3 seconds

    const searchInput = document.getElementById('search-input');
    
    const performSearch = debounce(async (value) => {
        if (value === '') {
            const initialBooks = await fetchRandomBooks(10);
            await displayBooks(initialBooks);
            // Also add retry for search results
            setTimeout(() => {
                const hasBooks = document.querySelector('.book-card:not(.book-card-skeleton)');
                if (!hasBooks) {
                    retryDisplayBooks();
                }
            }, 3000);
        } else {
            const searchResults = await searchBooks(value);
            await displayBooks(searchResults);
        }
    }, 300);

    searchInput.addEventListener('input', async (e) => {
        performSearch(e.target.value.trim());
    });
});


const backToTopBtn = document.getElementById('back-to-top');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        backToTopBtn.style.display = 'block';
    } else {
        backToTopBtn.style.display = 'none';
    }
});

backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});