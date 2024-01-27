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

  customFetch: async (
    URI,
    method = "GET",
    headers = new Headers(),
    contentType = "other"
  ) => {
    return fetch(URI, {
      method: method,
      headers: headers,
    })
      .then(
        (res) => {
          if (res.status === 404) {
            return 404;
          } else {
            const result = contentType === "file" ? res : res.json();
            return result;
          }
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
    const downloadPdfLink = $("#downloadpdf a")[0]?.attribs.href;
    let pagesLabel = $(".ubhypers:contains('Pages')");
    let pagesValue = pagesLabel.parent().next().find(".dhypers").text();
    let contentType = "zip";
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

    if (downloadPdfLink?.length) {
      contentType = "pdf";
      PNdetails.pdfUrl = `http://www.panjabdigilib.org/webuser/searches/${downloadPdfLink}`;
    }
    PNdetails.contentType = contentType;
    PNdetails.Pages = pagesValue;
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
        OAuth2AccessToken: metadata.oauthToken,
        userAgent: "bub2.toolforge ([[https://bub2.toolforge.org]])",
        defaultParams: {
          assert: "user",
        },
      });

      const commonsFilePayload = "commonsFilePayload.pdf";
      const title = metadata.details.volumeInfo.title || metadata.name;
      const response = await bot.upload(
        commonsFilePayload,
        title,
        metadata.commonsMetadata
      );
      if (await response.filename) {
        await fs.promises.unlink(commonsFilePayload);
      }
      logger.log({
        level: "info",
        message: `uploadToCommons: Upload of ${metadata.IAIdentifier} to commons successful`,
      });
      return {
        fileUploadStatus: 200,
        filename: response.filename,
      };
    } catch (error) {
      await fs.promises.unlink("commonsFilePayload.pdf");
      logger.log({
        level: "error",
        message: `uploadToCommons: ${error}`,
      });
      return error;
    }
  },
  uploadToWikiData: async (metadata, commonsItemFilename) => {
    const bot = await Mwn.init({
      apiUrl: "https://www.wikidata.org/w/api.php",
      OAuth2AccessToken: metadata.oauthToken,
      userAgent: "bub2.toolforge ([[https://bub2.toolforge.org]])",
      defaultParams: {
        assert: "user",
      },
    });

    async function createEntity(csrf_token) {
      try {
        const title = metadata.details.volumeInfo.title || "";
        const id = metadata.details.id || "";
        const authorsArr = metadata.details.volumeInfo.authors
          ? metadata.details.volumeInfo.authors.join().trim()
          : null;
        const authors = authorsArr || "";
        // Mapping for the labels/properties defined in `payload` - https://prop-explorer.toolforge.org/
        const payload = {
          labels: {
            en: {
              language: "en",
              value: commonsItemFilename,
            },
          },
          descriptions: {
            en: {
              language: "en",
              value: title,
            },
          },
          claims: {
            file_name: [
              {
                mainsnak: {
                  snaktype: "value",
                  property: "P18",
                  datavalue: {
                    value: commonsItemFilename,
                    type: "string",
                  },
                },
                type: "statement",
                rank: "normal",
              },
            ],
            file_url: [
              {
                mainsnak: {
                  snaktype: "value",
                  property: "P4765",
                  datavalue: {
                    value: `https://commons.wikimedia.org/wiki/File:${commonsItemFilename}`,
                    type: "string",
                  },
                },
                type: "statement",
                rank: "normal",
              },
            ],
            commons_category: [
              {
                mainsnak: {
                  snaktype: "value",
                  property: "P373",
                  datavalue: {
                    value: "Bub.wikimedia",
                    type: "string",
                  },
                },
                type: "statement",
                rank: "normal",
              },
            ],
            inventory_number: id
              ? [
                  {
                    mainsnak: {
                      snaktype: "value",
                      property: "P217",
                      datavalue: {
                        value: id,
                        type: "string",
                      },
                    },
                    type: "statement",
                    rank: "normal",
                  },
                ]
              : undefined,
            collection: [
              {
                mainsnak: {
                  snaktype: "value",
                  property: "P195",
                  datavalue: {
                    value: {
                      "entity-type": "item",
                      "numeric-id": 39162,
                      id: "Q39162", //wikidataID for 'opensource'
                    },
                    type: "wikibase-entityid",
                  },
                },
                type: "statement",
                rank: "normal",
              },
            ],
            title: title
              ? [
                  {
                    mainsnak: {
                      snaktype: "value",
                      property: "P1476",
                      datavalue: {
                        value: {
                          text: title,
                          language: "en",
                        },
                        type: "monolingualtext",
                      },
                    },
                    type: "statement",
                    rank: "normal",
                  },
                ]
              : undefined,
            name: title
              ? [
                  {
                    mainsnak: {
                      snaktype: "value",
                      property: "P2561",
                      datavalue: {
                        value: {
                          text: title,
                          language: "en",
                        },
                        type: "monolingualtext",
                      },
                    },
                    type: "statement",
                    rank: "normal",
                  },
                ]
              : undefined,
            file_format: [
              {
                mainsnak: {
                  snaktype: "value",
                  property: "P2701",
                  datavalue: {
                    value: {
                      "entity-type": "item",
                      "numeric-id": 42332,
                      id: "Q42332", // wikidataID for PDF
                    },
                    type: "wikibase-entityid",
                  },
                },
                type: "statement",
                rank: "normal",
              },
            ],
            author_name: authors
              ? [
                  {
                    mainsnak: {
                      snaktype: "value",
                      property: "P2093",
                      datavalue: {
                        value: authors,
                        type: "string",
                      },
                    },
                    type: "statement",
                    rank: "normal",
                  },
                ]
              : undefined,
            URL: [
              {
                mainsnak: {
                  snaktype: "value",
                  property: "P2699",
                  datavalue: {
                    value: `https://commons.wikimedia.org/wiki/File:${commonsItemFilename}`,
                    type: "string",
                  },
                },
                type: "statement",
                rank: "normal",
              },
            ],
            copyright_status: [
              {
                mainsnak: {
                  snaktype: "value",
                  property: "P6216",
                  datavalue: {
                    value: {
                      "entity-type": "item",
                      "numeric-id": 6938433,
                      id: "Q6938433", // wikidataID for CC0 license
                    },
                    type: "wikibase-entityid",
                  },
                },
                type: "statement",
                rank: "normal",
              },
            ],
          },
        };

        const res = await bot.request({
          action: "wbeditentity",
          new: "item",
          summary: "bub2.toolforge.org: upload commons item to wikidata",
          tags: "wikimedia-commons-app",
          data: JSON.stringify(payload),
          token: csrf_token,
        });
        logger.log({
          level: "info",
          message: `uploadToWikidata: Upload of ${commonsItemFilename} metadata to wikidata successful`,
        });
        return res.entity.id;
      } catch (error) {
        logger.log({
          level: "error",
          message: `uploadToWikidata:${error}`,
        });
        return 404;
      }
    }
    const csrf_token = await bot.getCsrfToken();
    return await createEntity(csrf_token);
  },
};
