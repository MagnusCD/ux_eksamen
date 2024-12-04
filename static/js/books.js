// books.js
let currentPage = 1;
const booksPerPage = 10;
const bookDetailsCache = new Map();

async function fetchRandomBooks(count = 10) {
    const books = await fetch(`http://localhost:8080/books?n=${count}`).then(response => response.json());
    return books;
}

async function displayBooks(books) {
    const allBooksContainer = document.getElementById('all-books');
    
    if (books.length > 0) {
        const bookCards = books.map(book => `
            <article class="book-card" 
                data-book-id="${book.book_id}"
                tabindex="0" 
                role="button"
                alt="Book Cover"
                loading="lazy"   
                aria-label="View details for ${book.title} by ${book.author}"
                onclick="window.location.href='/book-details.html?id=${book.book_id}'"
                onkeydown="if(event.key === 'Enter') window.location.href='/book-details.html?id=${book.book_id}'">
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
        `);

        allBooksContainer.innerHTML = bookCards.join('');

        for (const book of books) {
            let cover = 'static/images/placeholder-cover.png';
            if (bookDetailsCache.has(book.book_id)) {
                const cachedDetails = bookDetailsCache.get(book.book_id);
                if (cachedDetails.cover && cachedDetails.cover.trim() !== '') {
                    cover = cachedDetails.cover;
                }
            } else {
                const details = await fetch(`http://localhost:8080/books/${book.book_id}`).then(response => response.json());
                if (details.cover && details.cover.trim() !== '') {
                    bookDetailsCache.set(book.book_id, details);
                    cover = details.cover;
                }
            }
            const img = allBooksContainer.querySelector(`[data-book-id="${book.book_id}"] img`);
            if (img) img.src = cover;
        }
    } else {
        allBooksContainer.innerHTML = '<p>No books found.</p>';
    }
}

async function loadMoreBooks() {
    try {
        const allBooksContainer = document.getElementById('all-books');
        const moreBooks = await fetchRandomBooks(booksPerPage);
        
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
                const bookCard = `
                    <article class="book-card" 
                        data-book-id="${book.book_id}"
                        tabindex="0" 
                        role="button"
                        aria-label="View details for ${book.title} by ${book.author}"
                        onclick="window.location.href='/book-details.html?id=${book.book_id}'"
                        onkeydown="if(event.key === 'Enter') window.location.href='/book-details.html?id=${book.book_id}'">
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
                allBooksContainer.insertAdjacentHTML('beforeend', bookCard);
                displayedBookIds.add(book.book_id);

                let cover = 'static/images/placeholder-cover.png';
                if (bookDetailsCache.has(book.book_id)) {
                    const cachedDetails = bookDetailsCache.get(book.book_id);
                    if (cachedDetails.cover && cachedDetails.cover.trim() !== '') {
                        cover = cachedDetails.cover;
                    }
                } else {
                    const details = await fetch(`http://localhost:8080/books/${book.book_id}`).then(response => response.json());
                    if (details.cover && details.cover.trim() !== '') {
                        bookDetailsCache.set(book.book_id, details);
                        cover = details.cover;
                    }
                }
                const img = allBooksContainer.querySelector(`[data-book-id="${book.book_id}"] img`);
                if (img) img.src = cover;
            }
        }

        currentPage++;
    } catch (error) {
        console.error('Error loading more books:', error);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const initialBooks = await fetchRandomBooks(10);
    await displayBooks(initialBooks);

    document.getElementById('load-more').addEventListener('click', async () => {
        document.getElementById('load-more').disabled = true;
        try {
            await loadMoreBooks();
        } finally {
            document.getElementById('load-more').disabled = false;
        }
    });
});