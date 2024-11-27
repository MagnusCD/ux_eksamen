// Fetch user's favorite books
async function getUserFavorites() {
    const userId = localStorage.getItem('userId');
    const response = await fetch(`http://localhost:8080/users/${userId}/favorites`);
    return await response.json();
}

// Display favorite books
async function displayFavorites() {
    const favoriteBooks = await getUserFavorites();
    const favoritesContainer = document.getElementById('favorites-container');

    if (favoriteBooks.length === 0) {
        favoritesContainer.innerHTML = '<p>You have no favorite books yet.</p>';
    } else {
        favoriteBooks.forEach(book => {
            const bookElement = document.createElement('div');
            bookElement.classList.add('book-item');
            bookElement.innerHTML = `
                <div class="book-cover">
                    <a href="/book.html?id=${book.id}">
                        <img src="${book.cover || '/static/images/placeholder-cover.png'}"
                             alt="${book.title}"
                             onerror="this.src='/static/images/placeholder-cover.png'">
                    </a>
                </div>
                <div class="book-info">
                    <h3><a href="/book.html?id=${book.id}">${book.title}</a></h3>
                    <p class="author">By ${book.author}</p>
                </div>
            `;
            favoritesContainer.appendChild(bookElement);
        });
    }
}

// Update favorites page when DOM is loaded
document.addEventListener('DOMContentLoaded', displayFavorites);