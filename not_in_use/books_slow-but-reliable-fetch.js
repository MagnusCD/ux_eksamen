let isMounted = false;
let currentFetchController = null;
let currentPage = 1;
const booksPerPage = 10;
const bookDetailsCache = new Map();

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

async function fetchWithRetry(url, maxRetries = 3, delay = 1000) {
   if (currentFetchController) {
       currentFetchController.abort();
   }
   currentFetchController = new AbortController();

   for (let i = 0; i < maxRetries; i++) {
       try {
           const response = await fetch(url, {
               signal: currentFetchController.signal
           });
           if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
           const data = await response.json();
           if (!isMounted) return null;
           return data;
       } catch (error) {
           if (error.name === 'AbortError') {
               console.log('Fetch aborted');
               return null;
           }
           if (i === maxRetries - 1) throw error;
           await new Promise(resolve => setTimeout(resolve, delay));
           if (!isMounted) return null;
       }
   }
}

async function fetchRandomBooks(count = 10) {
   try {
       const books = await fetchWithRetry(`http://localhost:8080/books?n=${count}`);
       if (!books || !isMounted) return [];
       
       // Kør fetches sekventielt
       const booksWithDetails = [];
       for (const book of books) {
           if (!isMounted) break;
           
           try {
               // Check cache first
               if (bookDetailsCache.has(book.book_id)) {
                   const cachedDetails = bookDetailsCache.get(book.book_id);
                   booksWithDetails.push({
                       ...book,
                       cover: cachedDetails.cover && cachedDetails.cover.trim() !== '' 
                           ? cachedDetails.cover 
                           : 'static/images/placeholder-cover.png'
                   });
                   continue;
               }

               // Fetch new details
               const details = await fetchWithRetry(`http://localhost:8080/books/${book.book_id}`);
               if (details && details.cover && details.cover.trim() !== '') {
                   console.log(`Successfully fetched cover for: ${book.title}`, {
                       coverUrl: details.cover,
                       fullDetails: details
                   });
                   bookDetailsCache.set(book.book_id, details);
                   booksWithDetails.push({ ...book, cover: details.cover });
               } else {
                   booksWithDetails.push({ ...book, cover: 'static/images/placeholder-cover.png' });
               }
           } catch (error) {
               console.error(`Failed to fetch details for book ${book.book_id}:`, error);
               booksWithDetails.push({ ...book, cover: 'static/images/placeholder-cover.png' });
           }
       }

       return booksWithDetails;
   } catch (error) {
       console.error('Error fetching random books:', error);
       return [];
   }
}

async function createBookCard(book) {
   if (!isMounted) return null;

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
       if (!response || !isMounted) return [];
       return response.filter(book => 
           book.title.toLowerCase().includes(searchTerm.toLowerCase())
       );
   } catch (error) {
       console.error('Error searching books:', error);
       return [];
   }
}

async function displayBooks(books) {
   if (!isMounted) return;

   const allBooksContainer = document.getElementById('all-books');
   allBooksContainer.innerHTML = '';

   // Show a loading indicator
   allBooksContainer.innerHTML = '<div class="book-card book-card-skeleton"></div>'.repeat(10);

   const displayedBookIds = new Set();

   if (Array.isArray(books)) {
       const bookCards = [];
       for (const book of books) {
           if (!isMounted) break;
           if (!displayedBookIds.has(book.book_id)) {
               const bookCard = await createBookCard(book);
               if (bookCard) {
                   bookCards.push(bookCard);
                   displayedBookIds.add(book.book_id);
               }
           }
       }

       if (isMounted) {
           allBooksContainer.innerHTML = bookCards.join('');
       }
   } else {
       const initialBooks = await fetchRandomBooks(10);
       if (!isMounted) return;
       
       const initialBookCards = [];
       for (const book of initialBooks) {
           if (!isMounted) break;
           if (!displayedBookIds.has(book.book_id)) {
               const bookCard = await createBookCard(book);
               if (bookCard) {
                   initialBookCards.push(bookCard);
                   displayedBookIds.add(book.book_id);
               }
           }
       }

       if (isMounted) {
           allBooksContainer.innerHTML = initialBookCards.join('');
       }
   }
}

async function loadMoreBooks() {
    if (!isMounted) return;

    try {
        // Add skeleton loaders after existing content
        const allBooksContainer = document.getElementById('all-books');
        allBooksContainer.insertAdjacentHTML('beforeend', 
            '<div class="book-card book-card-skeleton"></div>'.repeat(booksPerPage)
        );

        const moreBooks = await fetchRandomBooks(booksPerPage);
        if (!isMounted) return;
        
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
            if (!isMounted) break;
            if (!displayedBookIds.has(book.book_id)) {
                const bookCard = await createBookCard(book);
                if (bookCard) {
                    allBooksContainer.insertAdjacentHTML('beforeend', bookCard);
                    displayedBookIds.add(book.book_id);
                }
            }
        }

        currentPage++;
    } catch (error) {
        console.error('Error loading more books:', error);
        if (isMounted) {
            // Remove skeleton loaders if there's an error
            const skeletons = document.querySelectorAll('.book-card-skeleton');
            skeletons.forEach(skeleton => skeleton.remove());
            
            alert('An error occurred while loading more books.');
        }
    }
}

document.addEventListener('DOMContentLoaded', async () => {
   isMounted = true;

   // Cleanup function for when leaving the page
   const cleanup = () => {
       isMounted = false;
       if (currentFetchController) {
           currentFetchController.abort();
       }
   };

   // Add cleanup on page unload
   window.addEventListener('unload', cleanup);

   document.getElementById('load-more').addEventListener('click', async () => {
       if (!isMounted) return;
       
       const button = document.getElementById('load-more');
       button.disabled = true;
       try {
           await loadMoreBooks();
       } finally {
           if (isMounted) {
               button.disabled = false;
           }
       }
   });

   const searchInput = document.getElementById('search-input');
   
   const performSearch = debounce(async (value) => {
       if (!isMounted) return;
       
       if (value === '') {
           const initialBooks = await fetchRandomBooks(10);
           if (isMounted) await displayBooks(initialBooks);
       } else {
           const searchResults = await searchBooks(value);
           if (isMounted) await displayBooks(searchResults);
       }
   }, 300);

   searchInput.addEventListener('input', async (e) => {
       performSearch(e.target.value.trim());
   });

   await displayBooks();
});