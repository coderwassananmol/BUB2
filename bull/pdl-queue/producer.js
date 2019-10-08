const Queue = require('bull');
const PDLQueue = new Queue('pdl-queue');
require('./consumer')
module.exports = async (bookid, categoryID, email) => {
    PDLQueue.add({
        bookid,
        categoryID,
        email
    })
}