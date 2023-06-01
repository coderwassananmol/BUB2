/* Helper functions to modularize the code */
const fetch = require("isomorphic-fetch");
const rp = require("request-promise");
const _ = require("lodash");
const winston = require("winston");
const logger = winston.loggers.get("defaultLogger");

module.exports = {
  checkForDuplicatesFromIA: async (ID) => {
    return fetch(
      `https://archive.org/advancedsearch.php?q=${ID}&fl[]=identifier&output=json`
    )
      .then(
        (res) => res.json(),
        (err) => console.log(err)
      )
      .catch((err) => console.log(err));
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
};
