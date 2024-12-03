// favorites.js
async function fetchBookDetails(bookId) {
    try {
        const response = await fetch(`http://localhost:8080/books/${bookId}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching book details:', error);
        return null;
    }
}

async function getUserFavorites() {
    const favoriteIds = JSON.parse(localStorage.getItem('favorites') || '[]');
    const favorites = [];
    
    for (const bookId of favoriteIds) {
        const bookDetails = await fetchBookDetails(bookId);
        if (bookDetails) {
            favorites.push(bookDetails);
        }
    }
    
    return favorites;
}

async function displayFavorites() {
    if (!localStorage.getItem('userId')) {
        window.location.href = '/login.htm';
        return;
    }

    const favoriteBooks = await getUserFavorites();
    const favoritesContainer = document.getElementById('favorites-container');

    if (favoriteBooks.length === 0) {
        favoritesContainer.innerHTML = '<p>You have no favorite books yet.</p>';
    } else {
        favoritesContainer.innerHTML = ''; 
        favoriteBooks.forEach(book => {
            const bookElement = document.createElement('div');
            bookElement.classList.add('book-card');
            bookElement.setAttribute('data-book-id', book.book_id);
            bookElement.innerHTML = `
                <div class="book-cover">
                    <img src="${book.cover || '/static/images/placeholder-cover.png'}"
                         alt="${book.title}"
                         onerror="this.src='/static/images/placeholder-cover.png'">
                    <button class="heart-icon filled" onclick="removeFromFavorites(${book.book_id})">
                        <i class="fa-solid fa-heart"></i>
                    </button>
                </div>
                <h3>${book.title}</h3>
                <p>${book.author}</p>
            `;
            favoritesContainer.appendChild(bookElement);
        });
    }
}

async function removeFromFavorites(bookId) {
    try {
        // Get current favorites
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        
        // Remove the book ID
        const index = favorites.indexOf(bookId);
        if (index > -1) {
            favorites.splice(index, 1);
        }
        
        // Save back to localStorage
        localStorage.setItem('favorites', JSON.stringify(favorites));
        
        // Show alert and refresh
        alert("Book removed from favorites!");
        location.reload();
        
    } catch (error) {
        console.error('Error removing from favorites:', error);
        alert("Error removing book from favorites");
    }
}

document.addEventListener('DOMContentLoaded', displayFavorites);