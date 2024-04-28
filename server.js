#!/usr/bin/env node
const express = require("express");
const next = require("next");
const bodyParser = require("body-parser");
const cors = require("cors");
const open = require("open");
const compression = require("compression");
require("dotenv").config();
const dev = process.env.NODE_ENV !== "production";
const PORT = process.env.PORT || 5000;
const GB_KEY = process.env.GB_KEY;
const trove_key = process.env.trove_key;
const winston = require("winston");
const cheerio = require("cheerio"); // Basically jQuery for node.js
const app = next({
  dev,
});

const logger = winston.loggers.add("defaultLogger", {
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    //
    // - Write all logs with importance level of `error` or less to `error.log`
    // - Write all logs with importance level of `info` or less to `combined.log`
    //
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

const handle = app.getRequestHandler();
var emailaddr = "";
var authUserName = "";
const {
  customFetch,
  queueData,
  statusConfig,
  bookTitle,
  userNameLocation,
  getPreviewLink,
  jobData,
  checkForPublicDomain,
  checkIfFileExistsAtIA,
  replaceTitle,
  getPDLTitle,
} = require("./utils/helper.js");
const GoogleBooksProducer = require("./bull/google-books-queue/producer");
const PDLProducer = require("./bull/pdl-queue/producer");
const TroveProducer = require("./bull/trove-queue/producer");
const { exec } = require("child_process");
const config = require("./utils/bullconfig");
const _ = require("lodash");

app
  .prepare()
  .then(() => {
    const server = express();

    //Parse application/x-www-form-urlencoded
    server.use(
      bodyParser.urlencoded({
        extended: true,
      })
    );

    //Parse application/json
    server.use(bodyParser.json());

    //Enable and use CORS
    server.use(
      cors({
        credentials: true,
        origin: true,
      })
    );

    server.use(compression());

    /**
     * Every custom route that we build needs to arrive before the * wildcard.
     * This is necessary because otherwise the server won't recognise the route.
     */

    server.get("/getstats", async (req, res) => {
      const pdl_queue = await config.getNewQueue("pdl-queue").getJobCounts();
      const google_books_queue = await config
        .getNewQueue("google-books-queue")
        .getJobCounts();
      const trove_queue = await config
        .getNewQueue("trove-queue")
        .getJobCounts();
      const queueStats = {
        pdl: pdl_queue,
        gb: google_books_queue,
        trove: trove_queue,
      };
      const commonsRes = await customFetch(
        process.env.NEXT_PUBLIC_COMMONS_URL +
          "/w/api.php?action=query&prop=categoryinfo&titles=Category:Files_uploaded_with_BUB2&format=json",
        "GET"
      );
      customFetch(
        `https://archive.org/advancedsearch.php?q=${process.env.IA_EMAIL}+&rows=0&output=json`,
        "GET"
      ).then((resp) => {
        if (resp && resp.response && resp.response.numFound) {
          const pages = commonsRes?.query?.pages;
          const page_no = pages[`${_.keys(pages)}`];
          res.send({
            queueStats: queueStats,
            totalUploadedCount: resp.response.numFound,
            commonsUploadedCount: page_no?.categoryinfo?.files
              ? page_no.categoryinfo.files
              : "0",
          });
        }
      });
    });

    server.get("/getJobInformation", async (req, res) => {
      try {
        let queue, queueName;
        switch (req.query.queue_name) {
          case "gb":
            queue = config.getNewQueue("google-books-queue");
            queueName = "Google Books";
            break;

          case "pdl":
            queue = config.getNewQueue("pdl-queue");
            queueName = "Panjab Digital Library";
            break;

          case "trove":
            queue = config.getNewQueue("trove-queue");
            queueName = "Trove Digital Library";
            break;

          default:
            throw "Invalid queue";
        }
        if (req.query.job_id) {
          const job = await queue.getJob(req.query.job_id);
          if (job) {
            const queue_data = await queueData(job, queue);
            const progress = job.progress().value
              ? `${job.progress().step}${job.progress().value}`
              : job.progress();
            const jobState = await job.getState();
            const book_id = job.data.details.id || job.data.details.bookID;
            const categoryID = job.data.details.categoryID;
            const trueURI = _.get(queue_data, "trueURI");
            if (req.query.queue_name === "trove") {
              _.set(
                queue_data,
                "coverImage",
                "https://assets.nla.gov.au/logos/trove/trove-colour.svg"
              );
            }
            let uploadLink;
            const obj = {
              progress: progress,
              queueName: queueName,
              previewLink: getPreviewLink(
                req.query.queue_name,
                book_id,
                categoryID
              ),
              uploadStatus: {
                uploadLink: trueURI,
                isUploaded: jobState === "completed" ? true : false,
              },
              wikimedia_links: job.progress().wikiLinks?.commons
                ? job.progress().wikiLinks.commons
                : "Not Integrated",
            };
            res.send(
              Object.assign(
                {},
                _.pick(queue_data, [
                  "title",
                  "description",
                  "imageLinks",
                  "coverImage",
                ]),
                obj
              )
            );
          } else {
            res.send({});
          }
        } else {
          res.send({});
        }
      } catch (err) {
        res.send({});
        logger.log({
          level: "error",
          message: `getJobInformation ${err}`,
        });
      }
    });

    server.get("/getJobProgress", async (req, res) => {
      let queue;
      switch (req.query.queue_name) {
        case "gb":
          queue = config.getNewQueue("google-books-queue");
          break;

        case "pdl":
          queue = config.getNewQueue("pdl-queue");
          queueName = "Panjab Digital Library";
          break;

        case "trove":
          queue = config.getNewQueue("trove-queue");
          queueName = "Trove Digital Library";
          break;

        default:
          throw "Invalid queue";
      }
      if (req.query.job_id) {
        const job = await queue.getJob(req.query.job_id);
        if (job) {
          return job.progress().value;
        }
        return null;
      }
      return null;
    });

    server.get("/allJobs", async (req, res) => {
      String.prototype.capitalize = function () {
        return this.charAt(0).toUpperCase() + this.slice(1);
      };

      const returnJobStatus = (failedReason, finishedOn, processedOn) => {
        if (failedReason) return `Failed! (Reason: ${failedReason})`;
        if (!finishedOn) finishedOn = null;
        if (!processedOn) processedOn = null;
        const sum = processedOn + finishedOn;
        return statusConfig(processedOn, sum)[sum];
      };

      try {
        let queue;
        switch (req.query.queue_name) {
          case "gb":
            queue = config.getNewQueue("google-books-queue");
            break;

          case "pdl":
            queue = config.getNewQueue("pdl-queue");
            break;

          case "trove":
            queue = config.getNewQueue("trove-queue");
            break;

          default:
            throw "Invalid queue";
        }
        queue
          .getJobs([
            "active",
            "waiting",
            "completed",
            "failed",
            "delayed",
            "paused",
          ])
          .then((jobs) => {
            let filteredJobs = jobs.map((job) => {
              let date = new Date(job.timestamp);
              let userName = _.get(
                job.data,
                userNameLocation[req.query.queue_name]
              );
              return {
                id: Number(job.id),
                title: _.get(job.data.details, bookTitle[req.query.queue_name]),
                userName: userName ? userName : "-",
                timestamp:
                  date.getUTCFullYear() +
                  "-" +
                  parseInt(date.getUTCMonth() + 1)
                    .toString()
                    .padStart(2, "0") +
                  "-" +
                  date.getUTCDate().toLocaleString(undefined, {
                    minimumIntegerDigits: 2,
                  }) +
                  " " +
                  date.getUTCHours() +
                  ":" +
                  date.getUTCMinutes().toLocaleString(undefined, {
                    minimumIntegerDigits: 2,
                  }) +
                  " (UTC)",
                upload_progress: job.progress().step
                  ? `${job.progress().step}:${job.progress().value}`
                  : `${job.progress()}%`,
                status: returnJobStatus(
                  job.failedReason,
                  job.finishedOn,
                  job.processedOn
                ),
                wikimedia_links: job.progress().wikiLinks?.commons
                  ? job.progress().wikiLinks.commons
                  : "Not Integrated",
              };
            });
            res.send(_.orderBy(filteredJobs, "id", "desc"));
          })
          .catch((err) => {
            res.send([]);
            logger.log({
              level: "error",
              message: `allJobs getJobs ${err}`,
            });
          });
      } catch (err) {
        res.send([]);
        logger.log({
          level: "error",
          message: `allJobs ${err}`,
        });
      }
    });

    server.get("/getqueue", async (req, res) => {
      const pdl_queue = await config.getNewQueue("pdl-queue");
      const google_books_queue = await config.getNewQueue("google-books-queue");
      const trove_queue = await config.getNewQueue("trove-queue");
      const commons_queue = await config.getNewQueue("commons-queue");

      const queryParams = {
        "gb-queue": {
          active: "",
          waiting: "",
        },
        "pdl-queue": {
          active: "",
          waiting: "",
        },
        "trove-queue": {
          active: "",
          waiting: "",
        },
        "commons-queue": {
          active: "",
          waiting: "",
        },
      };
      const pdlqueue_active_job = await pdl_queue.getActive(0, 0);
      const pdlqueue_waiting_job = await pdl_queue.getWaiting(0, 0);

      const gbqueue_active_job = await google_books_queue.getActive(0, 0);
      const gbqueue_waiting_job = await google_books_queue.getWaiting(0, 0);

      const trovequeue_active_job = await trove_queue.getActive(0, 0);
      const trovequeue_waiting_job = await trove_queue.getWaiting(0, 0);

      const commonsqueue_active_job = await commons_queue.getActive(0, 0);
      const commonsqueue_waiting_job = await commons_queue.getWaiting(0, 0);

      queryParams["pdl-queue"]["active"] = jobData(
        pdlqueue_active_job[0],
        "pdl"
      );
      queryParams["pdl-queue"]["waiting"] = jobData(
        pdlqueue_waiting_job[0],
        "pdl"
      );

      queryParams["gb-queue"]["active"] = jobData(gbqueue_active_job[0], "gb");
      queryParams["gb-queue"]["waiting"] = jobData(
        gbqueue_waiting_job[0],
        "gb"
      );

      queryParams["trove-queue"]["active"] = jobData(
        trovequeue_active_job[0],
        "trove"
      );
      queryParams["trove-queue"]["waiting"] = jobData(
        trovequeue_waiting_job[0],
        "trove"
      );

      queryParams["commons-queue"]["active"] = jobData(
        commonsqueue_active_job[0],
        "commons"
      );
      queryParams["commons-queue"]["waiting"] = jobData(
        commonsqueue_waiting_job[0],
        "commons"
      );
      res.send(queryParams);
    });

    let GBdetails = {};
    let GBreq;
    const isAlphanumericLess50 = /^[a-zA-Z0-9]{1,50}$/;
    server.get("/check", async (req, res) => {
      const {
        bookid,

        option,

        email,

        userName,

        IAtitle,
        isEmailNotification,

        isUploadCommons,
        oauthToken,
        commonsMetadata,
      } = req.query;
      emailaddr = email;
      authUserName = userName;
      switch (option) {
        case "gb":
          customFetch(
            `https://www.googleapis.com/books/v1/volumes/${bookid}?key=${GB_KEY}`,
            "GET",
            new Headers({
              "Content-Type": "application/json",
            })
          ).then(async (data) => {
            const { error } = checkForPublicDomain(data, res);
            if (!error) {
              const titleInIA =
                IAtitle.trim() !== ""
                  ? replaceTitle(IAtitle.trim())
                  : replaceTitle(data.volumeInfo.title);
              if (isAlphanumericLess50.test(titleInIA) === false) {
                res.send({
                  isInValidIdentifier: true,
                  titleInIA,
                });
              } else if ((await checkIfFileExistsAtIA(titleInIA)) === true) {
                res.send({
                  isDuplicate: true,
                  titleInIA,
                });
              } else {
                GBdetails = data;
                GBreq = req;
                res.send({
                  error: false,
                  message: "In public domain.",
                  url: data.accessInfo.pdf.downloadLink,
                  title: data.volumeInfo.title,
                  IAIdentifier: titleInIA,
                });
              }
            }
          });
          break;

        case "obp":
          res.send({
            error: false,
            message: "You will be mailed with the details soon!",
          });

        case "pn":
          //Check for duplicates
          const { categoryID } = req.query;
          const uri = `http://www.panjabdigilib.org/webuser/searches/displayPage.jsp?ID=${bookid}&page=1&CategoryID=${categoryID}&Searched=W3GX`;
          var options = {
            uri,
            transform: function (body) {
              return cheerio.load(body);
            },
          };
          const titleInIA =
            IAtitle.trim() !== ""
              ? replaceTitle(IAtitle.trim())
              : replaceTitle(await getPDLTitle(options));
          if (titleInIA === "") {
            res.send({
              error: true,
              message: "Not able to fetch title.",
            });
          } else if (isAlphanumericLess50.test(titleInIA) === false) {
            res.send({
              isInValidIdentifier: true,
              titleInIA,
            });
          } else {
            if ((await checkIfFileExistsAtIA(titleInIA)) === true) {
              res.send({
                isDuplicate: true,
                titleInIA,
              });
            } else {
              res.send({
                error: false,
                message: "You will be mailed with the details soon!",
              });
              PDLProducer(
                bookid,
                titleInIA,
                categoryID,
                email,
                authUserName,
                isEmailNotification
              );
            }
          }
          // const isDuplicate = checkForDuplicatesFromIA(`bub_pn_${bookid}`);
          // isDuplicate.then(resp => {
          //   if (resp.response.numFound != 0) {
          //     res.send({
          //       error: true,
          //       message: "The document already exists on Internet Archive."
          //     })
          //   }
          //   else {

          //   }
          // })
          break;

        case "trove":
          customFetch(
            `https://api.trove.nla.gov.au/v2/newspaper/${bookid}?key=${trove_key}&encoding=json&reclevel=full`,
            "GET",
            new Headers({
              "Content-Type": "application/json",
            })
          ).then(async (data) => {
            if (data === 404) {
              res.send({
                error: true,
                message: "Invalid Newspaper/Gazette ID",
              });
            } else {
              const name = _.get(data, "article.title.value");
              const titleInIA =
                IAtitle.trim() !== ""
                  ? replaceTitle(IAtitle.trim())
                  : replaceTitle(name);
              if (isAlphanumericLess50.test(titleInIA) === false) {
                res.send({
                  isInValidIdentifier: true,
                  titleInIA,
                });
              } else if ((await checkIfFileExistsAtIA(titleInIA)) === true) {
                res.send({
                  isDuplicate: true,
                  titleInIA,
                });
              } else {
                troveUrl = `https://trove.nla.gov.au/ndp/del/title/${data.article.title.id}`;
                const id = _.get(data, "article.title.id");
                const date = _.get(data, "article.date");
                const troveData = {
                  id,
                  name,
                  troveUrl,
                  date,
                };
                res.send({
                  error: false,
                  message: "You will be mailed with the details soon!",
                });
                TroveProducer(
                  bookid,

                  titleInIA,

                  troveData,

                  email,

                  userName,
                  isEmailNotification,
                  isUploadCommons,
                  oauthToken,
                  commonsMetadata
                );
              }
            }
          });
          break;
      }
    });

    server.get("/checkEmailableStatus", async (req, res) => {
      const { username } = req.query;
      const usersQuery = await customFetch(
        process.env.NEXT_PUBLIC_WIKIMEDIA_URL +
          `/w/api.php?action=query&list=users&ususers=${username}&usprop=emailable&format=json`,
        "GET"
      );
      const emailableStatus =
        usersQuery?.query?.users[0]?.emailable === undefined ? false : true;
      res.send(emailableStatus);
    });

    server.get("/getMetadata", async (req, res) => {
      const { option, id } = req.query;
      switch (option) {
        case "gb":
          const gbRes = await customFetch(
            `https://www.googleapis.com/books/v1/volumes/${id}?key=${GB_KEY}`,
            "GET"
          );
          res.send(gbRes);
          break;
        case "trove":
          const troveRes = await customFetch(
            `https://api.trove.nla.gov.au/v2/newspaper/${id}?key=${trove_key}&encoding=json&reclevel=full`,
            "GET"
          );
          res.send(troveRes);
          break;
      }
    });

    server.post("/webhook", async (req, res) => {
      exec(
        "cd www/js; git pull origin master; yes | npm install; webservice --backend kubernetes node16 restart",
        (err, stdout, stderr) => {
          if (err) {
            logger.log({
              level: "error",
              message: `webhook err ${err}`,
            });
          } else if (stderr) {
            logger.log({
              level: "error",
              message: `webhook stderr ${stderr}`,
            });
          } else {
            logger.log({
              level: "info",
              message: `webhook ${stdout}`,
            });
          }
        }
      );
      res.send();
    });

    server.post("/download", async (req, res) => {
      const regex = /https:\/\/books\.googleusercontent\.com\/books\/content\?req=*/;
      if (regex.test(req.body.url)) {
        res.send({
          error: false,
          message: "You will be mailed with the details soon!",
        });
        GoogleBooksProducer(
          req.body.url,
          req.body.titleInIA,
          GBdetails,
          emailaddr,
          authUserName,
          GBreq.query.isEmailNotification,
          GBreq.query.isUploadCommons,
          GBreq.query.oauthToken,
          GBreq.query.commonsMetadata
        );
      } else {
        res.send({
          error: true,
          message: "Invalid URL.",
        });
      }
    });

    /**
     * The express handler for default routes.
     */
    server.get("*", (req, res) => {
      return handle(req, res);
    });

    /**
     * The express handler for default POST routes (for next-auth)
     */
    server.post("*", (req, res) => {
      return handle(req, res);
    });

    server.listen(PORT, (err) => {
      if (err) throw err;
      if (dev) {
        (async () => {
          await open(`http://localhost:${PORT}/`);
        })();
      }
    });
  })
  .catch((ex) => {
    console.error(ex.stack);
    process.exit(1);
  });
