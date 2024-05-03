const config = require("../../utils/bullconfig");
const PDLQueue = config.getNewQueue("pdl-queue");
const cheerio = require("cheerio"); // Basically jQuery for node.js
require("./consumer");
const { getPDLMetaData } = require("../../utils/helper.js");

module.exports = async (
  bookid,
  IAIdentifier,
  categoryID,
  email,
  userName,
  isEmailNotification,
  isUploadCommons,
  oauthToken,
  commonsMetadata
) => {
  const uri = `http://www.panjabdigilib.org/webuser/searches/displayPage.jsp?ID=${bookid}&page=1&CategoryID=${categoryID}&Searched=W3GX`;
  var options = {
    uri,
    transform: function (body) {
      return cheerio.load(body);
    },
  };

  const metaData = await getPDLMetaData(options, bookid, categoryID);

  metaData["email"] = email;
  metaData["userName"] = userName;
  metaData["IAIdentifier"] = IAIdentifier;
  metaData["isEmailNotification"] = isEmailNotification;
  metaData["isUploadCommons"] = isUploadCommons;
  metaData["oauthToken"] = oauthToken;
  metaData["commonsMetadata"] = commonsMetadata;
  const details = {
    details: metaData,
  };
  PDLQueue.add(details);
};
