"use strict"

function checkAdminAuth() {
    const isAdmin = sessionStorage.getItem('userRole') === 'admin';
    if (!isAdmin) {
        window.location.href = '/';
        return false;
    }
    return true;
}

async function fetchAuthors() {
    try {
        const response = await fetch('http://localhost:8080/authors');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const authors = await response.json();
        const select = document.getElementById('authorSelect');
        
        if (!select) {
            throw new Error('Author select element not found');
        }
        
        authors.sort((a, b) => a.author_name.localeCompare(b.author_name));
        
        select.innerHTML = '<option value="">Select an author</option>'; 
        
        authors.forEach(author => {
            const option = document.createElement('option');
            option.value = author.author_id;
            option.textContent = `${author.author_name}`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching authors:', error);
        const select = document.getElementById('authorSelect');
        if (select) {
            select.innerHTML = '<option value="">Error loading authors</option>';
        }
    }
}

async function fetchPublishers() {
    try {
        const response = await fetch('http://localhost:8080/publishers');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const publishers = await response.json();
        const select = document.getElementById('publisherSelect');
        
        if (!select) {
            throw new Error('Publisher select element not found');
        }
        
        publishers.sort((a, b) => a.publisher_name.localeCompare(b.publisher_name));
        
        select.innerHTML = '<option value="">Select a publisher</option>'; 
        
        publishers.forEach(publisher => {
            const option = document.createElement('option');
            option.value = publisher.publisher_id;
            option.textContent = publisher.publisher_name;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching publishers:', error);
        const select = document.getElementById('publisherSelect');
        if (select) {
            select.innerHTML = '<option value="">Error loading publishers</option>';
        }
    }
}

async function handleFormSubmit(url, formData, successMessage, refreshFunction) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }
        
        alert(successMessage);
        if (refreshFunction) {
            await refreshFunction();
        }
        return true;
    } catch (error) {
        console.error('Error:', error);
        alert(error.message || 'An error occurred');
        return false;
    }
}

document.getElementById('addBookForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!checkAdminAuth()) return;
    
    const formData = new FormData(e.target);
    const success = await handleFormSubmit(
        'http://localhost:8080/admin/books',
        formData,
        'Book added successfully!'
    );
    
    if (success) {
        e.target.reset();
        await Promise.all([fetchAuthors(), fetchPublishers()]);
    }
});

document.getElementById('addAuthorForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!checkAdminAuth()) return;
    
    const formData = new FormData(e.target);
    const success = await handleFormSubmit(
        'http://localhost:8080/admin/authors',
        formData,
        'Author added successfully!'
    );
    
    if (success) {
        e.target.reset();
        await fetchAuthors();
    }
});

document.getElementById('addPublisherForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!checkAdminAuth()) return;
    
    const formData = new FormData(e.target);
    const success = await handleFormSubmit(
        'http://localhost:8080/admin/publishers',
        formData,
        'Publisher added successfully!'
    );
    
    if (success) {
        e.target.reset();
        await fetchPublishers();
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    try {
        if (!checkAdminAuth()) return;
        
        await Promise.all([
            fetchAuthors(),
            fetchPublishers()
        ]);
    } catch (error) {
        console.error('Error initializing admin page:', error);
    }
});