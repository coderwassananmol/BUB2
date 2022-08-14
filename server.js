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
const app = next({
  dev,
});
const handle = app.getRequestHandler();
var emailaddr = "";
const {
  customFetch,
  queueData,
  statusConfig,
  bookTitle,
  getPreviewLink,
} = require("./utils/helper.js");
const { checkForPublicDomain } = require("./controller/GB");
const GoogleBooksProducer = require("./bull/google-books-queue/producer");
const PDLProducer = require("./bull/pdl-queue/producer");
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
      const queryParams = { pdl_queue, google_books_queue };
      res.send(queryParams);
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
            ueueName = "Panjab Digital Library";
            break;

          default:
            throw "Invalid queue";
        }
        if (req.query.job_id) {
          const job = await queue.getJob(req.query.job_id);
          if (job) {
            const queue_data = await queueData(job, queue);
            const progress = job.progress();
            const book_id = job.data.details.id || job.data.details.bookID;
            const categoryID = job.data.details.categoryID;
            const obj = {
              progress: progress,
              queueName: queueName,
              previewLink: getPreviewLink(
                req.query.queue_name,
                book_id,
                categoryID
              ),
              uploadStatus: {
                uploadLink:
                  progress === 100
                    ? `https://archive.org/details/bub_${req.query.queue_name}_${book_id}`
                    : "",
                isUploaded: progress === 100 ? true : false,
              },
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
        console.log(err, "::err");
      }
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

          default:
            throw "Invalid queue";
        }
        queue
          .getJobs()
          .then((jobs) => {
            let filteredJobs = jobs.map((job) => {
              return {
                id: job.id,
                title: _.get(job.data.details, bookTitle[req.query.queue_name]),
                upload_progress: job.progress(),
                status: returnJobStatus(
                  job.failedReason,
                  job.finishedOn,
                  job.processedOn
                ),
              };
            });
            res.send(filteredJobs);
          })
          .catch((err) => {
            res.send([]);
            console.log(err, "::err");
          });
      } catch (err) {
        res.send([]);
        console.log(err, "::err");
      }
    });

    server.get("/getqueue", async (req, res) => {
      const pdl_queue = await config.getNewQueue("pdl-queue");
      const google_books_queue = await config.getNewQueue("google-books-queue");

      const queryParams = {
        "gb-queue": {
          active: {},
          waiting: {},
        },
        "pdl-queue": {
          active: {},
          waiting: {},
        },
      };
      const pdlqueue_active_job = await pdl_queue.getActive(0, 0);
      const pdlqueue_waiting_job = await pdl_queue.getWaiting(0, 0);

      const gbqueue_active_job = await google_books_queue.getActive(0);
      const gbqueue_waiting_job = await google_books_queue.getWaiting(0);

      queryParams["pdl-queue"]["active"] = await queueData(
        pdlqueue_active_job[0],
        pdl_queue
      );
      queryParams["pdl-queue"]["waiting"] = await queueData(
        pdlqueue_waiting_job[0],
        pdl_queue
      );

      queryParams["gb-queue"]["active"] = await queueData(
        gbqueue_active_job[0],
        google_books_queue
      );
      queryParams["gb-queue"]["waiting"] = await queueData(
        gbqueue_waiting_job[0],
        google_books_queue
      );

      res.send(queryParams);
    });

    let GBdetails = {};
    server.get("/check", async (req, res) => {
      const { bookid, option, email } = req.query;
      emailaddr = email;
      switch (option) {
        case "gb":
          customFetch(
            `https://www.googleapis.com/books/v1/volumes/${bookid}?key=${GB_KEY}`,
            "GET",
            new Headers({
              "Content-Type": "application/json",
            })
          ).then((data) => {
            const { error } = checkForPublicDomain(data, res);
            if (!error) {
              GBdetails = data;
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
          res.send({
            error: false,
            message: "You will be mailed with the details soon!",
          });
          PDLProducer(bookid, categoryID, email);
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
      }
    });

    server.post("/webhook", async (req, res) => {
      exec(
        "git pull; yes | npm install; webservice --backend kubernetes node10 restart",
        (err, stdout, stderr) => {
          if (err) {
            console.log("::err::", err);
          } else if (stderr) {
            console.log("::stderr::", stderr);
          } else {
            console.log("::stdout::".stdout);
          }
        }
      );
      res.send();
    });

    server.post("/download", async (req, res) => {
      res.send({
        error: false,
        message: "You will be mailed with the details soon!",
      });

      GoogleBooksProducer(req.body.url, GBdetails, emailaddr);
      // download.downloadFromGoogleBooks(
      //   req.body.url,
      //   GBdetails,
      //   emailaddr
      // );
    });

    /**
     * The express handler for default routes.
     */
    server.get("*", (req, res) => {
      return handle(req, res);
    });

    server.listen(PORT, (err) => {
      if (err) throw err;
      console.log(`> Ready on port ${PORT}`);
      if (dev) {
        (async () => {
          console.log(`opening into browser: http://localhost:${PORT}/`);
          await open(`http://localhost:${PORT}/`);
        })();
      }
    });
  })
  .catch((ex) => {
    console.error(ex.stack);
    process.exit(1);
  });
