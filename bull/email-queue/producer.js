const config = require("../../utils/bullconfig");
require("./consumer");

const EmailQueue = config.getNewQueue("email-queue");

module.exports = async (email, title, trueURI, success) => {
  EmailQueue.add({
    email,
    title,
    trueURI,
    success
  });
};
