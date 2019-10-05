const Queue = require('bull');
const PDLQueue = new Queue('pdl-queue');
require('./consumer')
module.exports = async (bookid, categoryID) => {
    PDLQueue.add({
        bookid,
        categoryID
    })
}