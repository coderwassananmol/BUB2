const config = require("../../utils/bullconfig");
require("./consumer");

const EmailQueue = config.getNewQueue("email-queue");

module.exports = async (userName, title, trueURI, status) => {
  EmailQueue.add({
    userName,
    title,
    trueURI,
    status,
  });
};
