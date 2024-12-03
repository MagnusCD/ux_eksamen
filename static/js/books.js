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
             onclick="window.location.href='/book.html?id=${book.book_id}'"
             onkeydown="if(event.key === 'Enter') window.location.href='/book.html?id=${book.book_id}'">
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
 
    const displayedBookIds = new Set();
 
    if (Array.isArray(books)) {
        for (const book of books) {
            if (!displayedBookIds.has(book.book_id)) {
                const bookCard = await createBookCard(book);
                allBooksContainer.insertAdjacentHTML('beforeend', bookCard);
                displayedBookIds.add(book.book_id);
            }
        }
    } else {
        const initialBooks = await fetchRandomBooks(10);
        for (const book of initialBooks) {
            if (!displayedBookIds.has(book.book_id)) {
                const bookCard = await createBookCard(book);
                allBooksContainer.insertAdjacentHTML('beforeend', bookCard);
                displayedBookIds.add(book.book_id);
            }
        }
    }
 }
 
 async function loadMoreBooks() {
    try {
        const moreBooks = await fetchRandomBooks(booksPerPage);
        const allBooksContainer = document.getElementById('all-books');
        
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
    }, 300);
 
    searchInput.addEventListener('input', async (e) => {
        performSearch(e.target.value.trim());
    });
 });