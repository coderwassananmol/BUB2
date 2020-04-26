const request = require("request-promise");
const cheerio = require("cheerio");

export const PdlDetails = async (id, categoryId) => {
  const pdlURI = `http://www.panjabdigilib.org/webuser/searches/displayPage.jsp?ID=${id}&page=1&CategoryID=${categoryId}&Searched=W3GX`;
  const response = await request({
    uri: pdlURI,
    headers: {
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
      "Accept-Encoding": "gzip, deflate",
      "Accept-Language": "en-US,en;q=0.9,hi;q=0.8",
      Host: "www.panjabdigilib.org",
      "Upgrade-Insecure-Requests": 1,
    },
  });

  let $ = cheerio.load(response);
  let title = $(
    "#Nanakshahi>tbody>tr:nth-child(3)>td>table>tbody>tr:nth-child(2)>td>table>tbody>tr>td:nth-child(2)>table:nth-child(22)>tbody>tr:nth-child(3)>td>table>tbody>tr:nth-child(2)>td>table>tbody>tr>td:nth-child(2)>div>table>tbody>tr:nth-child(1)>td>a"
  )
    .text()
    .trim();
  let authorLabel = $(
    "#Nanakshahi>tbody>tr:nth-child(3)>td>table>tbody>tr:nth-child(2)>td>table>tbody>tr>td:nth-child(2)>table:nth-child(22)>tbody>tr:nth-child(3)>td>table>tbody>tr:nth-child(2)>td>table>tbody>tr>td:nth-child(2)>div>table>tbody>tr:nth-child(3)>td>table>tbody>tr>td:nth-child(1)"
  )
    .text()
    .trim();
  let author = $(
    "#Nanakshahi>tbody>tr:nth-child(3)>td>table>tbody>tr:nth-child(2)>td>table>tbody>tr>td:nth-child(2)>table:nth-child(22)>tbody>tr:nth-child(3)>td>table>tbody>tr:nth-child(2)>td>table>tbody>tr>td:nth-child(2)>div>table>tbody>tr:nth-child(3)>td>table>tbody>tr>td:nth-child(2)>a"
  )
    .text()
    .trim();
  let description = $(
    "#Nanakshahi>tbody>tr:nth-child(3)>td>table>tbody>tr:nth-child(2)>td>table>tbody>tr>td:nth-child(2)>table:nth-child(22)>tbody>tr:nth-child(3)>td>table>tbody>tr:nth-child(2)>td>table>tbody>tr>td:nth-child(2)>div>table>tbody>tr:nth-child(2)>td>table>tbody>tr:nth-child(1)>td:nth-child(2)"
  )
    .text()
    .trim();
  let preview = $(
    "#Nanakshahi>tbody>tr:nth-child(3)>td>table>tbody>tr:nth-child(2)>td>table>tbody>tr>td:nth-child(2)>table:nth-child(22)>tbody>tr:nth-child(3)>td>table>tbody>tr:nth-child(2)>td>table>tbody>tr>td:nth-child(1)>table>tbody>tr:nth-child(1)>td>table>tbody>tr>td>a>img"
  )
    .attr("src")
    .slice(8);

  const details = {
    title: title,
    author: authorLabel != "Author" ? "" : author,
    description:
      description == "Click here to add description"
        ? "No description available"
        : description,
    preview: "http://www.panjabdigilib.org" + preview,
  };

  return details;
};
