import os
import requests
from library_api.database import get_db
from library_api.utils import error_message, convert_to_html_entities

"""
Returns a dictionary with basic book info by ID
"""
def basic_book_info(book_id: int):
    db = get_db()
    book = db.execute(
        '''
        SELECT tbook.cTitle AS title, trim(tauthor.cName || ' ' || tauthor.cSurname) AS author,
            tpublishingcompany.cName AS publishing_company, tbook.nPublishingYear AS publishing_year
        FROM tbook
            INNER JOIN tauthor
                ON tbook.nAuthorID = tauthor.nAuthorID
            INNER JOIN tpublishingcompany
                ON tbook.nPublishingCompanyID = tpublishingcompany.nPublishingCompanyID
        WHERE tbook.nBookID = ?
        ''',
        (book_id,)
    ).fetchone()
    
    if book == None:
        return error_message('Book not found'), 404
    else:        

        # The book title is obtained from the book cover API
        book_cover_base_url = os.getenv('BOOK_COVER_BASE_URL')
        book_title = convert_to_html_entities(book['title'])
        author_name = convert_to_html_entities(book['author'])
        book_cover_url = f'{book_cover_base_url}?book_title={book_title}&author_name={author_name}'
        result = dict(requests.get(book_cover_url).json())
        if 'error' in result:
            cover = ''
        else:
            cover = result['url']

        # The sqlite row is converted to a dictionary
        book_info = {key: book[key] for key in book.keys()}
        book_info['cover'] = cover
        return book_info