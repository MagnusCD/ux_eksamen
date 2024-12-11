// back-button.js

document.addEventListener('DOMContentLoaded', () => {
    const backButton = document.querySelector('.back-button');
    console.log('Back button found:', backButton); // Debug log
    
    if (backButton) {
        backButton.addEventListener('click', handleBackClick);
        console.log('Click handler added to back button'); // Debug log
    }
});

function handleBackClick(event) {
    console.log('Back button clicked'); // Debug log
    event.preventDefault();
    console.log('History length:', window.history.length); // Debug log
    
    if (window.history.length > 1) {
        console.log('Going back in history'); // Debug log
        window.history.back();
    } else {
        console.log('No history, going to index'); // Debug log
        window.location.href = 'index.html';
    }
}