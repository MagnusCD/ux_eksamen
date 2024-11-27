// Fetch book details for a specific book
async function fetchBookDetails(bookId) {
    try {
        const response = await fetch(`http://localhost:8080/books/${bookId}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching book details:', error);
        return null;
    }
}

// Get user's favorites from localStorage and fetch their details
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

// Display favorite books
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
        favoritesContainer.innerHTML = ''; // Clear container first
        favoriteBooks.forEach(book => {
            const bookElement = document.createElement('div');
            bookElement.classList.add('book-card'); // Brug samme klasse som på forsiden
            bookElement.innerHTML = `
                <div class="book-cover">
                    <img src="${book.cover || '/static/images/placeholder-cover.png'}"
                         alt="${book.title}"
                         onerror="this.src='/static/images/placeholder-cover.png'">
                    <button class="heart-icon" onclick="removeFromFavorites(${book.book_id})">
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

// Remove a book from favorites
async function removeFromFavorites(bookId) {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const index = favorites.indexOf(bookId);
    
    if (index !== -1) {
        favorites.splice(index, 1);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        await displayFavorites(); // Refresh the display
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', displayFavorites);