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

function createBookCard(books) {
    return `
        <div class="book-card">
            <div class="book-cover">
                <img 
                    src="${books.cover || '/static/images/placeholder-cover.png'}" 
                    alt="${books.title}"
                />
                <button class="heart-icon" aria-label="Add to favorites">♡</button>
            </div>
            <h3>${books.title}</h3>
            <p>${books.author}</p>
        </div>
    `;
}

async function displayBooks() {
    try {
        const books = await fetchRandomBooks(10);
        const allBooksContainer = document.getElementById('all-books');
        
        allBooksContainer.innerHTML = '';

        for (const book of books) {
            allBooksContainer.insertAdjacentHTML('beforeend', createBookCard(book));
        }
    } catch (error) {
        console.error('Error displaying books:', error);
    }
}

document.addEventListener('DOMContentLoaded', displayBooks);