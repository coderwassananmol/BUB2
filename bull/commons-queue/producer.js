const config = require("../../utils/bullconfig");
const CommonsQueue = config.getNewQueue("commons-queue");
require("./consumer");
module.exports = async (
  type = "other",
  downloadFileURL = null,
  metadata,
  callback
) => {
  CommonsQueue.add({
    type,
    downloadFileURL,
    metadata,
    callback,
  });
  process.on("commonsJobComplete", (commonsResponse) => {
    callback(commonsResponse);
  });
};
