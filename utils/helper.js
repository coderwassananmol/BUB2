/* Helper functions to modularize the code */
const fetch = require("isomorphic-fetch");
const rp = require("request-promise");
const _ = require("lodash");
const winston = require("winston");
const { truncate } = require("fs");
const logger = winston.loggers.get("defaultLogger");
const fs = require("fs");
const { Mwn } = require("mwn");
const JSZip = require("jszip");
const PDFDocument = require("pdfkit");
const path = require("path");
const { PDFDocument: PDFLibDocument } = require("pdf-lib");

module.exports = {
  checkIfFileExistsAtIA: async (ID) => {
    const fetchCall = await fetch(`https://archive.org/metadata/${ID}`);
    const resp = await fetchCall.json();
    if (!_.isEmpty(resp)) {
      if (_.has(resp, "metadata.uploader") === true) {
        return resp.metadata.uploader !== process.env.IA_EMAIL;
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

  convertZipToPdf: async (targetZip, localFilePath) => {
    async function mergePdf(pdfDataArray) {
      try {
        const mergedPdf = await PDFLibDocument.create();
        for (const pdfData of pdfDataArray) {
          const pdfDoc = await PDFLibDocument.load(pdfData);
          const pages = await mergedPdf.copyPages(
            pdfDoc,
            pdfDoc.getPageIndices()
          );
          for (const page of pages) {
            mergedPdf.addPage(page);
          }
        }

        const mergedPdfFile = await mergedPdf.save();
        await fs.promises.writeFile(localFilePath, mergedPdfFile);
        return { status: 200 };
      } catch (error) {
        logger.log({
          level: "error",
          message: `PDL -  convertZipToPdf/mergePdf: ${error}`,
        });
        return { status: 404, error: error };
      }
    }

    async function zipToPdf() {
      try {
        const pdfInstances = [];
        await Promise.all(
          Object.values(targetZip.files).map(async (file, index) => {
            if (file.dir) return;
            if ([".jpg", ".jpeg", ".png"].includes(path.extname(file.name))) {
              const data = await file.async("nodebuffer");
              const pdfDoc = new PDFDocument();
              const buffers = [];
              const writeStream = new require("stream").Writable({
                write(chunk, encoding, callback) {
                  buffers.push(chunk);
                  callback();
                },
              });
              pdfDoc.pipe(writeStream);
              pdfDoc.image(data, 0, 0, { fit: [595.28, 841.89] }); // A4 size
              pdfDoc.end();
              return new Promise((resolve) => {
                writeStream.on("finish", () => {
                  pdfInstances.push({
                    index,
                    pdfInstance: Buffer.concat(buffers),
                  });
                  resolve();
                });
              });
            }
          })
        );

        pdfInstances.sort((a, b) => a.index - b.index);

        const sortedPdfInstances = pdfInstances.map(
          ({ pdfInstance }) => pdfInstance
        );
        return await mergePdf(sortedPdfInstances);
      } catch (error) {
        logger.log({
          level: "error",
          message: `PDL -  convertZipToPdf/zipToPdf: ${error}`,
        });
        return { status: 404, error: error };
      }
    }
    return await zipToPdf();
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
        apiUrl: process.env.NEXT_PUBLIC_COMMONS_URL + "/w/api.php",
        OAuth2AccessToken: metadata.oauthToken,
        userAgent: "bub2.wmcloud ([[https://bub2.wmcloud.org]])",
        defaultParams: {
          assert: "user",
        },
      });

      const commonsFilePayload = "commonsFilePayload.pdf";
      let title =
        metadata.details?.volumeInfo?.title || metadata.name || metadata.title;
      title = title.replaceAll(".", "");
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
        message: `uploadToCommons (catch): ${error}`,
      });
      return error;
    }
  },

  uploadToWikiData: async (metadata, commonsItemFilename, libraryName) => {
    if (libraryName !== "gb") {
      //support only for Google Books for now
      return 404;
    }
    try {
      const title = metadata.details.volumeInfo.title || "";
      const id = metadata.details.id || "";
      const authorsArr = metadata.details.volumeInfo.authors
        ? metadata.details.volumeInfo.authors.join().trim()
        : null;

      const GBWikiDataPayload = {
        item: {
          labels: {
            en: title,
          },
          descriptions: {
            en: "edition of a written work",
          },
          statements: {
            P675: [
              {
                rank: "normal",
                property: {
                  id: "P675",
                },
                value: {
                  content: id,
                  type: "value",
                },
                qualifiers: [],
                references: [],
              },
            ],
            P31: [
              {
                rank: "normal",
                property: {
                  id: "P31",
                  "data-type": "wikibase-item",
                },
                value: {
                  type: "value",
                  content: "Q47461344", //wikidata id for 'written work'
                },
                qualifiers: [],
                references: [],
              },
            ],
            P996: [
              {
                rank: "normal",
                property: {
                  id: "P996",
                  "data-type": "commonsMedia",
                },
                value: {
                  content: commonsItemFilename,
                  type: "value",
                },
                qualifiers: [],
                references: [],
              },
            ],
            P2093: [
              {
                rank: "normal",
                property: {
                  id: "P2093",
                },
                value: {
                  content: authorsArr,
                  type: "value",
                },
                qualifiers: [],
                references: [],
              },
            ],
            P373: [
              {
                rank: "normal",
                property: {
                  id: "P373",
                },
                value: {
                  content: "Files_uploaded_with_BUB2",
                  type: "value",
                },
                qualifiers: [],
                references: [],
              },
            ],
            P1476: [
              {
                rank: "normal",
                property: {
                  id: "P1476",
                  "data-type": "monolingualtext",
                },
                value: {
                  type: "value",
                  content: {
                    text: title,
                    language: "en",
                  },
                },
                qualifiers: [],
                references: [],
              },
            ],
          },
        },
        tags: [],
        bot: false,
        comment: "Metadata updated by BUB2",
      };

      const wikiDataAPI = await fetch(
        "https://www.wikidata.org/w/rest.php/wikibase/v0/entities/items",
        {
          method: "POST",
          headers: {
            Authorization:
              "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI5N2I2ZWI0NDUyMTkxNGVhZjEwMWEzNDYxODIwY2VkYiIsImp0aSI6ImVkZDFhNjUyNTVmZDBjZmRiY2MwYjBjZDM4OTAzYTU0YzUzYjYwYmZlNTg0OGEzNDFmZDkxY2RjNzBhYTFmNjUyODU1ODAxNDM0ODk5YmQzIiwiaWF0IjoxNzE3NjEwNDM5Ljk1MTQ4MSwibmJmIjoxNzE3NjEwNDM5Ljk1MTQ4NSwiZXhwIjozMzI3NDUxOTIzOS45NDgyNjUsInN1YiI6IjQ0NzUwMDc2IiwiaXNzIjoiaHR0cHM6Ly9tZXRhLndpa2ltZWRpYS5vcmciLCJyYXRlbGltaXQiOnsicmVxdWVzdHNfcGVyX3VuaXQiOjUwMDAsInVuaXQiOiJIT1VSIn0sInNjb3BlcyI6WyJiYXNpYyIsImNyZWF0ZWVkaXRtb3ZlcGFnZSJdfQ.Q9Az8klW2dgriBi_nxrcVBWkHQYVgmAhnI_0sJerpzfGbUovaX3FKwO2HeRSzuD6mPE28qOGm0-GcEz48vGSmzjkvSBipNggVdg_pI2FERSe-5Go-3FFlGB7KE3p7y_DZOJlBFOZ6groho151uDUlZyZ7vJEpfcl0Nz0MkwNaN46_vJ9SZ5iPMcZBJmf4VPnEDv8B2BSB8wQxD78H6OBf9tlscSlwvXYaLg4jNQrTehRblM_KSen6h6Ph7Ctnmv2IVn3GrhoE6KHvpY6H8BNbN9exOujC_gDbfAG9uLiWfRIqozybOqudndZ_GEScp-1qgb7QI95QRkYIy3G0FvEl9FwQwUQ9mYuoD9rh-01tC3keCf-hJY7oItbTnZcatBKCQ01UU1pFFa-0AoaMtWGy3-d9dHKjKFW-ae2_WuQjp9XsHLJFzOKYBGUVdls5q7e3pPUfW6vUcviokaMDPhFQ3CZ1y7sRhJ-DIh0q3Ghl88uxHmjK1FjhcYtLLo2QCl6Xi8ePvQjJKXB3Cg5Zi2e20gS0Mb6HnBgR9UmvTuKCGp4SDmkC-QHfhZY-6_k69Ing_-AO03joMecT7zWwJ_hYq7shPDBwXp3k21eWCx6NxqC1C0L1bsdAObygIULlM9omvfjhErVwokjirlVQL-Hf-8kiWay2eo-PuZika67zfE",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(GBWikiDataPayload),
        }
      );
      if (wikiDataAPI.status === 201) {
        const data = await wikiDataAPI.json();
        return data.id;
      } else {
        const errorData = await wikiDataAPI.json();
        logger.log({
          level: "error",
          message: `wikiDataAPIFailure (fetch):${JSON.stringify(errorData)}`,
        });
        return 404;
      }
    } catch (error) {
      logger.log({
        level: "error",
        message: `uploadToWikidata:${error}`,
      });
      return 404;
    }
  },
};
