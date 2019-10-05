const Queue = require('bull');
require('./consumer')

const EmailQueue = new Queue('email-queue');

module.exports = async (email,title,trueURI,success) => {
    EmailQueue.add({
        email,
        title,
        trueURI,
        success
    })
}