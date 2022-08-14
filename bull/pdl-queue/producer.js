const config = require("../../utils/bullconfig");
const PDLQueue = config.getNewQueue("pdl-queue");
const cheerio = require("cheerio"); // Basically jQuery for node.js
require("./consumer");
const { getMetaData } = require("../../utils/helper.js");

module.exports = async (bookid, categoryID, email) => {
  const uri = `http://www.panjabdigilib.org/webuser/searches/displayPage.jsp?ID=${bookid}&page=1&CategoryID=${categoryID}&Searched=W3GX`;
  var options = {
    uri,
    transform: function (body) {
      return cheerio.load(body);
    },
  };

  const metaData = await getMetaData(options, bookid, categoryID);

  metaData["email"] = email;
  const details = {
    details: metaData,
  };
  PDLQueue.add(details);
};
