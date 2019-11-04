const Queue = require('bull');
const GoogleBooksQueue = new Queue('google-books-queue');
require('./consumer')
module.exports = async (uri, details, email) => {
    GoogleBooksQueue.add({
        uri,
        details,
        email
    })
}