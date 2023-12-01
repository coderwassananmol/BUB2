const config = require("../../utils/bullconfig");
const GoogleBooksQueue = config.getNewQueue("google-books-queue");
require("./consumer");
module.exports = async (
  uri,
  IAIdentifier,
  details,
  email,
  userName,
  isUploadCommons
) => {
  GoogleBooksQueue.add({
    uri,
    IAIdentifier,
    details,
    email,
    userName,
    isUploadCommons,
  });
};
