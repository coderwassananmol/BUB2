/* Helper functions to modularize the code */
const fetch = require("isomorphic-fetch");
const rp = require("request-promise");
const _ = require("lodash");
const winston = require("winston");
const { truncate } = require("fs");
const logger = winston.loggers.get("defaultLogger");
const fs = require("fs");
const { Mwn } = require("mwn");

module.exports = {
  checkIfFileExistsAtIA: async (ID) => {
    const fetchCall = await fetch(`https://archive.org/metadata/${ID}`);
    const resp = await fetchCall.json();
    if (!_.isEmpty(resp)) {
      if (_.has(resp, "metadata.uploader") === true) {
        return resp.metadata.uploader !== "bub.wikimedia@gmail.com";
      } else {
        return true;
      }
    } else {
      return false;
    }
  },

  replaceTitle: (title) => {
    return title.replace(/[ \(\)\[\],:]/g, "");
  },

  customFetch: async (URI, method = "GET", headers = new Headers()) => {
    return fetch(URI, {
      method: method,
      headers: headers,
    })
      .then(
        (res) => {
          if (res.status === 404) {
            return 404;
          } else return res.json();
        },
        (err) => {
          logger.log({
            level: "error",
            message: `customFetch ${err}`,
          });
          return 404;
        }
      )
      .catch((err) => {
        logger.log({
          level: "error",
          message: `customFetch catch ${err}`,
        });
        return 404;
      });
  },

  queueData: async (job, queue) => {
    if (!job) return null;
    const jobid = job.id;
    const { logs } = await queue.getJobLogs(jobid, 0);
    if (logs[0]) return JSON.parse(logs[0]);
    else return [];
  },

  bookTitle: {
    gb: "volumeInfo.title",
    pdl: "title",
    trove: "name",
  },

  userNameLocation: {
    gb: "userName",
    pdl: "details.userName",
    trove: "details.userName",
  },

  jobData: (job, queue) => {
    const bookTitlePath = {
      gb: "volumeInfo.title",
      pdl: "title",
      trove: "name",
    };
    if (!job) return null;
    return _.get(job.data.details, bookTitlePath[`${queue}`]);
  },

  statusConfig: (processedOn, sum) => {
    return {
      [sum]: "Completed",
      [processedOn]: "Active",
      0: "In Queue",
    };
  },

  getPreviewLink: (queue_name, book_id, category_id = null) => {
    const previewLinks = {
      gb: `http://books.google.co.in/books?id=${book_id}&hl=&source=gbs_api`,
      pdl: `http://www.panjabdigilib.org/webuser/searches/displayPage.jsp?ID=${book_id}&page=1&CategoryID=${category_id}&Searched=W3GX`,
      trove: `https://trove.nla.gov.au/ndp/del/title/${book_id}`,
    };
    return previewLinks[queue_name];
  },

  getPDLMetaData: async (cheerioOptions, bookid, categoryID) => {
    const $ = await rp(cheerioOptions);
    let PNdetails = {};
    const keys = $(".ubhypers");
    const values = $(".dhypers");

    function addOtherMetaData(limit, keys, values, PNdetails) {
      let value;
      for (let i = 0; i < values.length; i++) {
        if ($(values[i]).attr("href")) {
          if (!$(values[i]).attr("href").includes("Keywords")) {
            value = i;
            break;
          }
        }
      }

      if (value <= limit) {
        const add = limit - value;
        for (let i = value; i < values.length; i++) {
          PNdetails[[$(keys[i + add]).text()]] = $(values[i]).text().trim();
        }
      } else {
        const sub = value - limit;
        for (let i = value; i < values.length; i++) {
          PNdetails[[$(keys[i - sub]).text()]] = $(values[i]).text().trim();
        }
      }
    }

    if ($(values[0]).text().trim() === "Click here to add description") {
      if ($(values[1]).text().trim() === "Click here to suggest keywords") {
        for (let i = 2; i < values.length; i++) {
          PNdetails[[$(keys[i + 1]).text()]] = $(values[i]).text().trim();
        }
      } else {
        addOtherMetaData(4, keys, values, PNdetails);
      }
    } else if (
      $(values[0]).text().trim() === "Click here to suggest keywords"
    ) {
      for (let i = 1; i < values.length; i++) {
        PNdetails[[$(keys[i + 2]).text()]] = $(values[i]).text().trim();
      }
      PNdetails.description = $(
        "#Nanakshahi > tbody > tr:nth-child(3) > td > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(2) > table:nth-child(22) > tbody > tr:nth-child(3) > td > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(2) > div > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(1) > td:nth-child(2)"
      )
        .text()
        .trim();
    } else {
      addOtherMetaData(5, keys, values, PNdetails);
      PNdetails.description = $(
        "#Nanakshahi > tbody > tr:nth-child(3) > td > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(2) > table:nth-child(22) > tbody > tr:nth-child(3) > td > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(2) > div > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(1) > td:nth-child(2)"
      )
        .text()
        .trim();
      PNdetails.description = PNdetails.description.replace(/\n/g, "");
      PNdetails.description = PNdetails.description.replace(/\[edit]/g, "");
    }

    PNdetails.title = $(
      "#Nanakshahi > tbody > tr:nth-child(3) > td > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(2) > table:nth-child(22) > tbody > tr:nth-child(3) > td > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(2) > div > table > tbody > tr:nth-child(1) > td > a"
    )
      .text()
      .trim();
    PNdetails.bookID = bookid;
    PNdetails.categoryID = categoryID;
    let src = $(
      "#Nanakshahi > tbody > tr:nth-child(3) > td > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(2) > table:nth-child(22) > tbody > tr:nth-child(3) > td > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(1) > table > tbody > tr:nth-child(1) > td > table > tbody > tr > td > a > img"
    ).attr("src");
    src = src.match(/pdl.*/gm);
    PNdetails.coverImage = `http://panjabdigilib.org/${src}`;

    delete PNdetails[""];

    return PNdetails;
  },

  getPDLTitle: async (cheerioOptions) => {
    const $ = await rp(cheerioOptions);
    return $(
      "#Nanakshahi > tbody > tr:nth-child(3) > td > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(2) > table:nth-child(22) > tbody > tr:nth-child(3) > td > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(2) > div > table > tbody > tr:nth-child(1) > td > a"
    )
      .text()
      .trim();
  },

  getTroveMetaData: async (cheerioOptions) => {
    const $ = await rp(cheerioOptions);
    const issueRenditionId = $(".issueRendition")
      .attr("data-prepurl")
      .match(/\d+/);
    if (issueRenditionId && issueRenditionId !== null)
      return issueRenditionId[0];
    else
      logger.log({
        level: "error",
        message: `issueRenditionId not found ${issueRenditionId}`,
      });
  },
  checkForPublicDomain: (data, res) => {
    if (data === 404) {
      res.send({ error: true, message: "Invalid Book ID" });
      return {
        error: true,
      };
    }
    if (data.error) {
      if (data.error.code === 503) {
        //Google Books error
        res.send({ error: true, message: "Invalid Book ID" });
        return {
          error: true,
        };
      }
    } else {
      const { publicDomain } = data.accessInfo; //Response object destructuring
      if (publicDomain === false) {
        //Checking if the book belongs to publicDomain
        res.send({ error: true, message: "Not in public domain." });
        return {
          error: true,
        };
      } else {
        return {
          error: false,
          data,
        };
      }
    }
  },

  logUserData: (userName, libraryName) => {
    logger.log({
      level: "info",
      message: `User ${userName} uploaded using ${libraryName}`,
    });
  },
  downloadFile: async (downloadUrl, localFilepath) => {
    try {
      const fileRes = await fetch(downloadUrl, {
        method: "GET",
        headers: new Headers({
          "Content-Type": "application/pdf",
        }),
      });
      const fileBuffer = await fileRes.buffer();
      await fs.promises.writeFile(localFilepath, fileBuffer);
      return {
        writeFileStatus: 200,
      };
    } catch (error) {
      logger.log({
        level: "error",
        message: `downloadFile: ${error}`,
      });
      return error;
    }
  },
  uploadToCommons: async (metadata) => {
    try {
      const bot = await Mwn.init({
        apiUrl: "https://commons.wikimedia.org/w/api.php",
        username: process.env.EMAIL_BOT_USERNAME,
        password: process.env.EMAIL_BOT_PASSWORD,
        userAgent: "bub2.toolforge ([[https://bub2.toolforge.org]])",
        defaultParams: {
          assert: "user",
        },
      });

      const commonsFilePayload = "commonsFilePayload.pdf";
      let {
        title,
        subtitle,
        authors,
        publisher,
        publishedDate,
        language,
        pageCount,
        infoLink,
      } = metadata.details.volumeInfo;
      console.log("metadata.details.volumeInfo:", metadata.details.volumeInfo);
      console.log(
        "metadata.details.volumeInfo.subtitle:",
        metadata.details.volumeInfo.subtitle
      );
      const permission = `CCO No Rights Reserved https://creativecommons.org/publicdomain/mark/1.0/`;
      const authorsFormatted = authors ? authors.join().trim() : "";
      const response = await bot.upload(
        commonsFilePayload,
        title,
        `{{Book
|Author=${authorsFormatted}
|Title=${title}
|Description=${subtitle}
|Language=${language}
|Publication Date=${publishedDate}
|Source=${infoLink}
|Publisher=${publisher}
|Permission=${permission}
|Other_fields_1={{Information field|name=Rights|value=${metadata.details.accessInfo.accessViewStatus}|name=Pages|value=${pageCount}|name=Internet_Archive_Identifier|value=${metadata.IAIdentifier}}}
}}
{{cc-zero}}
[[Category:bub.wikimedia]]
`
      );
      if (await response.filename) {
        await fs.promises.unlink(commonsFilePayload);
      }
      logger.log({
        level: "info",
        message: `Polling - uploadToCommons: Upload of ${metadata.IAIdentifier} to commons successful`,
      });
      return {
        fileUploadStatus: 200,
        filename: response.filename,
      };
    } catch (error) {
      await fs.promises.unlink("commonsFilePayload.pdf");
      logger.log({
        level: "error",
        message: `Polling - uploadToCommons: ${error}`,
      });
      return error;
    }
  },
};
