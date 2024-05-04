const config = require("../../utils/bullconfig");
const CommonsQueue = config.getNewQueue("commons-queue");
require("./consumer");
module.exports = async (
  type = "other",
  downloadFileURL = null,
  metadata,
  callback
) => {
  const job = await CommonsQueue.add({
    type,
    downloadFileURL,
    metadata,
    callback,
  });
  process.on(`commonsJobComplete:${job.id}`, (commonsResponse) => {
    callback(commonsResponse);
  });
};
