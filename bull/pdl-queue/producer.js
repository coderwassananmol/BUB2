const config = require('../../utils/bullconfig')
const PDLQueue = config.getNewQueue('pdl-queue');
require('./consumer')
module.exports = async (bookid, categoryID, email) => {
    PDLQueue.add({
        bookid,
        categoryID,
        email
    })
}