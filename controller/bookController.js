var Book = require('../models/book');

module.exports = {
    /**
     * @returns {Promise} Returns the books based on the pagination
     * 
     */
    book_create_get: async (page) => {
        var allBooks;
        await Book.paginate(
            {}, 
            {page: page,sort: {_id : -1}}, 
            (err,result) => {
            if(err) throw err;
            if(result) {
                allBooks = result;
            }
        });
        return allBooks;
        /*await Book.find({},function (err, data) {
            if(err) throw err;
            if (data) {
                allBooks = data;
            }
          });
          return allBooks;*/
    },

    createBook: (id,publisher,downloadLink,publishedDate,imageLinks,previewLink,title,uri,statusText,callback) => {
        Book.create({
            bookid: id,
            publisher: publisher,
            publishedDate: publishedDate,
            imageLinks: imageLinks,
            previewLink: previewLink,
            downloadLink: downloadLink,
            title: title,
            uri: uri,
            statusText: statusText
        }, (err, data) => {
            if (err)
                throw err;
            else
                return callback(data._id);
          });
    },

    createBookMinimal: (id,imageLinks,previewLink,title,uri,statusText,callback) => {
        Book.create({
            bookid: id,
            imageLinks: imageLinks,
            previewLink: previewLink,
            title: title,
            uri: uri,
            statusText: statusText
        }, (err, data) => {
            if (err)
                throw err;
            else
                return callback(data._id);
          });
    },

    updateBook: async (statusText,id) => {
        try {
            Book.findOneAndUpdate(
                {_id: id},
                {
                    $set: {
                        statusText: statusText,
                    }
                },
                (err,doc,res) => {
                    if(err) throw err;
                }
            )
        }
        catch(e) {
            console.log(e);
        }
    },

    getParticularBook: async (bookid) => {
        var bookdetails;
        await Book.findOne({bookid: bookid}, (err, res) => {
            if(err) throw err;
            if(res) {
                bookdetails = res;
            }
        })
        return bookdetails;
    }
}

exports.index = function(req, res) {
    res.send('NOT IMPLEMENTED: Site Home Page');
};

// Display list of all books.
exports.book_list = function(req, res) {
    res.send('NOT IMPLEMENTED: Book list');
};

// Display detail page for a specific book.
exports.book_detail = function(req, res) {
    res.send('NOT IMPLEMENTED: Book detail: ' + req.params.id);
};

// Display book create form on GET.
exports.book_create_get = function(req, res) {
    Book.find({},function (err, data) {
        if(err) throw err;
        if (data) {
            return data;
        }
      });
};

// Handle book create on POST.
exports.book_create_post = function(req, res) {
    
};

// Display book delete form on GET.
exports.book_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Book delete GET');
};

// Handle book delete on POST.
exports.book_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Book delete POST');
};

// Display book update form on GET.
exports.book_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Book update GET');
};

// Handle book update on POST.
exports.book_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Book update POST');
};