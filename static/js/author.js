async function getAuthorIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('author_id');
  }
  
  async function fetchBooksByAuthor(authorId) {
    const response = await fetch(`http://localhost:8080/books?a=${authorId}`);
    const books = await response.json();
    return books;
  }
  
  function displayBooks(books) {
    const bookList = document.getElementById('book-list');
    bookList.innerHTML = '';
  
    books.forEach(book => {
      bookList.insertAdjacentHTML('beforeend', createBookCard(book));
    });
  }
  
    books.forEach(book => {
      const bookElement = document.createElement('div');
      bookElement.className = 'book';
      bookElement.innerHTML = `
        <h3>${book.title}</h3>
        <p>Publishing Year: ${book.publishing_year}</p>
        <p>Publishing Company: ${book.publishing_company}</p>
      `;
      bookList.appendChild(bookElement);
    });
  
  
  async function fetchAuthorName(authorId) {
    const response = await fetch('http://localhost:8080/authors');
    const authors = await response.json();
    const author = authors.find(author => author.author_id === Number(authorId));
    return author ? author.author_name : 'Unknown Author';
  }
  
  async function init() {
    const authorId = await getAuthorIdFromUrl();
    if (authorId) {
      const books = await fetchBooksByAuthor(authorId);
      const authorName = await fetchAuthorName(authorId);
      document.getElementById('author-name').textContent = authorName;
      displayBooks(books);
    }
}