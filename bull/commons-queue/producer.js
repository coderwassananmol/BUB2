const config = require("../../utils/bullconfig");
const CommonsQueue = config.getNewQueue("commons-queue");
require("./consumer");
module.exports = async (downloadFileURL = null, metadata, callback) => {
  const job = await CommonsQueue.add({
    downloadFileURL,
    metadata,
    callback,
  });
  process.on(`commonsJobComplete:${job.id}`, (commonsResponse) => {
    callback(commonsResponse);
  });
};
