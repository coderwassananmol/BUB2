const config = require("../../utils/bullconfig");
const TroveQueue = config.getNewQueue("trove-queue");
const { getTroveMetaData } = require("../../utils/helper.js");
const cheerio = require("cheerio"); // Basically jQuery for node.js

require("./consumer");
module.exports = async (
  bookid,

  IAIdentifier,

  metaData,

  email,

  userName,
  isEmailNotification,
  isUploadCommons,
  oauthToken,
  commonsMetadata
) => {
  const uri = `https://trove.nla.gov.au/newspaper/article/${bookid}`;
  var options = {
    uri,
    transform: function (body) {
      return cheerio.load(body);
    },
  };

  const issueRenditionId = await getTroveMetaData(options);

  metaData["email"] = email;
  metaData["issueRenditionId"] = issueRenditionId;
  metaData["userName"] = userName;
  metaData["IAIdentifier"] = IAIdentifier;
  metaData["isEmailNotification"] = isEmailNotification;
  metaData["isUploadCommons"] = isUploadCommons;
  metaData["oauthToken"] = oauthToken;
  metaData["commonsMetadata"] = commonsMetadata;

  const details = {
    details: metaData,
  };
  TroveQueue.add(details);
};
