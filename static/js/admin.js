// admin.js
function checkAdminAuth() {
    const isAdmin = localStorage.getItem('userRole') === 'admin';
    if (!isAdmin) {
        window.location.href = '/'; 
        return false;
    }
    return true;
}

async function fetchAuthors() {
    try {
        const response = await fetch('http://localhost:8080/authors');
        const authors = await response.json();
        const select = document.getElementById('authorSelect');
        
        authors.sort((a, b) => a.author_name.localeCompare(b.author_name));
        
        select.innerHTML = '<option value="">Select an author</option>'; // Default empty option
        
        authors.forEach(author => {
            const option = document.createElement('option');
            option.value = author.author_id;
            option.textContent = `${author.author_name}`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching authors:', error);
    }
}

async function fetchPublishers() {
    try {
        const response = await fetch('http://localhost:8080/publishers');
        const publishers = await response.json();
        const select = document.getElementById('publisherSelect');
        
        publishers.sort((a, b) => a.publisher_name.localeCompare(b.publisher_name));
        
        select.innerHTML = '<option value="">Select a publisher</option>'; // Default empty option
        
        publishers.forEach(publisher => {
            const option = document.createElement('option');
            option.value = publisher.publisher_id;
            option.textContent = publisher.publisher_name;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching publishers:', error);
    }
}

document.getElementById('addBookForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!checkAdminAuth()) return;
    
    const formData = new FormData(e.target);
    try {
        const response = await fetch('http://localhost:8080/admin/books', {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            alert('Book added successfully!');
            e.target.reset();
            await fetchAuthors();
            await fetchPublishers();
        } else {
            const data = await response.json();
            alert(data.error || 'Error adding book');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error adding book');
    }
});

document.getElementById('addAuthorForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!checkAdminAuth()) return;
    
    const formData = new FormData(e.target);
    try {
        const response = await fetch('http://localhost:8080/admin/authors', {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            alert('Author added successfully!');
            e.target.reset();
            await fetchAuthors();
        } else {
            const data = await response.json();
            alert(data.error || 'Error adding author');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error adding author');
    }
});

document.getElementById('addPublisherForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!checkAdminAuth()) return;
    
    const formData = new FormData(e.target);
    try {
        const response = await fetch('http://localhost:8080/admin/publishers', {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            alert('Publisher added successfully!');
            e.target.reset();
            await fetchPublishers();
        } else {
            const data = await response.json();
            alert(data.error || 'Error adding publisher');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error adding publisher');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    if (!checkAdminAuth()) return;
    
    fetchAuthors();
    fetchPublishers();
});