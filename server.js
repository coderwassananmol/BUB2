const express = require("express");
const next = require("next");
const bodyParser = require("body-parser");
const cors = require("cors");
const download = require("./utils/download.js");
const compression = require("compression");
require("dotenv").config();
const cheerio = require("cheerio"); // Basically jQuery for node.js
const rp = require("request-promise");
const dev = process.env.NODE_ENV !== "production";
const GB_KEY = process.env.GB_KEY;
const app = next({ dev });
const handle = app.getRequestHandler();
const bookController = require("./controller/bookController");
var emailaddr = "";
const Queue = require('bull');
const { customFetch } = require('./utils/helper.js');
const { checkForDuplicatesFromIA } = require('./utils/helper.js');
const { checkForPublicDomain } = require('./controller/GB');
const Arena = require('bull-arena');

require('./controller/processor');
app
  .prepare()
  .then(() => {
    const server = express();

    //Parse application/x-www-form-urlencoded
    server.use(bodyParser.urlencoded({ extended: true }));

    //Parse application/json
    server.use(bodyParser.json());

    //Enable and use CORS
    server.use(cors({ credentials: true, origin: true }));

    server.use(compression());

    const arenaConfig = Arena({
      queues: [
        {
          // Name of the bull queue, this name must match up exactly with what you've defined in bull.
          name: "google-books-queue",

          // Redis auth.
          redis: {
            port: '6379',
            host: '127.0.0.1',
          },
        },
      ],
    },
      {
        // Make the arena dashboard become available at {my-site.com}/arena.
        basePath: '/queue',

        // Let express handle the listening.
        disableListen: true
      });

    //server.use(arenaConfig)

    const GoogleBooksQueue = new Queue('google-books-queue'); //Keeping both the queues separate

    GoogleBooksQueue.process(function (job) {
      setTimeout(function () {
        return Promise.resolve(500)
      }, 5000)
    })

    GoogleBooksQueue.on('completed', (job, result) => {
      console.log(`Job with id ${job.id} has been completed`);
      console.log(result)
    })

    /**
     * Every custom route that we build needs to arrive before the * wildcard.
     * This is necessary because otherwise the server won't recognise the route.
     */

    /**
     * Get the information on the basis of book id that we generate on each book being requested to upload.
     */
    server.get("/upload/:id", (req, res) => {
      const actualPage = "/status";
      let queryParams;
      bookController.getParticularBook(req.params.id).then(response => {
        queryParams = response;
        app.render(req, res, actualPage, queryParams);
      });
    });

    // /**
    //  * Redirect to the first page of the queue.
    //  * /queue should directly lead to /queue/1
    //  * If an ID is specified separately, it will go the next API.
    //  */
    // server.get("/queue", (req, res) => {
    //   res.redirect("/queue/1");
    // });

    // server.get("/queue/:id", (req, res) => {
    //   /**
    //    * Slight modification to be done here.
    //    * @param {Number} page that contains a number which can be used in pagination.
    //    * Suppose page=1, then fetch the latest 20 entries which implies that each page can
    //    * get maximum 20 entries.
    //    * Whenever a request to http://localhost:3000/queue occurs, it by default checks for
    //    * http://localhost:3000/queue?page=1, else, it checks for ?page parameter.
    //    * Fetch data for 40 books at once.
    //    */

    //   //ans.then(response => res.send(response));
    // });

    /**
     * TODO:
     * This route must change to /check. For every request that is being hit with either "GB" or "PN".
     * It must check the IA to see if the book already exists.
     * Then, if the source is Google Books, then it must hit the API to check if the book is in public domain. If it's in public domain, the user must see a prompt to upload the book or not, else he will be shown an alert.
     * Else, if the source is PDL, then all the information should be retreived from the API and the user must see a prompt to upload the book or not.
     */
    let GBdetails = {};
    server.get("/check", async (req, res) => {
      const { bookid, option, email } = req.query;
      emailaddr = email;
      switch (option) {
        case "gb":
          customFetch(`https://www.googleapis.com/books/v1/volumes/${bookid}?key=${GB_KEY}`, 'GET', new Headers({ "Content-Type": "application/json" }))
            .then(data => {
              const { error } = checkForPublicDomain(data, res)
              if (!error) {
                GBdetails = data
              }
            });
          break;

        case "pn":
          //Check for duplicates
          const isDuplicate = checkForDuplicatesFromIA(`bub_pn_${bookid}`);
          isDuplicate.then(resp => {
            if (resp.response.numFound != 0) {
              res.send({
                error: true,
                message: "The document already exists on Internet Archive."
              })
            }
          })
          const { categoryID } = req.query;
          let PNdetails = {};
          let documentID = '';
          const uri = `http://www.panjabdigilib.org/webuser/searches/displayPageContent.jsp?ID=${bookid}&page=1&CategoryID=${categoryID}&Searched=W3GX`;
          var options = {
            uri,
            transform: function (body) {
              return cheerio.load(body);
            }
          };
          await rp(options)
            .then(async function ($) {
              console.log(bookid);
              let images = [];
              const no_of_pages = $(
                "form > table > tbody > tr > td > table > tbody > tr > td:nth-child(2) > table > tbody > tr > td:nth-child(1) > table > tbody > tr > td:nth-child(4) > b"
              ).text();
              PNdetails.pages = no_of_pages;
              PNdetails.id = bookid;
              PNdetails.title = $(
                "body > table > tbody > tr > td:nth-child(2) > table > tbody > tr:nth-child(7) > td > table > tbody > tr > td:nth-child(2) > table > tbody > tr:nth-child(2) > td > table:nth-child(10) > tbody > tr:nth-child(2) > td"
              ).text();
              PNdetails.previewLink = uri;
              res.send({
                error: false,
                message: "You will be mailed with the details soon!"
              });
              for (let i = 1; i <= no_of_pages; ++i) {
                const str = `http://www.panjabdigilib.org/images?ID=${
                  PNdetails.id
                  }&page=${i}&pagetype=null&Searched=W3GX`;
                console.log(str);
                await rp({
                  method: "GET",
                  uri: str,
                  encoding: null,
                  transform: function (body, response) {
                    return { headers: response.headers, data: body };
                  }
                })
                  .then(async function (body) {
                    if (/image/.test(body.headers["content-type"])) {
                      var data =
                        "data:" +
                        body.headers["content-type"] +
                        ";base64," +
                        new Buffer(body.data).toString("base64");
                      images.push(data);
                    }
                  })
                  .catch(function (err) {
                    console.log(err)
                  })
              }
              PNdetails.imageLinks = images;
            })
            .catch(function (err) {
              // Crawling failed or Cheerio choked...
              res.send({
                error: true,
                message: "Invalid URL."
              })
              console.log(err)
            })

          let metadataURI = uri.replace("displayPageContent", "displayPage");
          await rp({
            uri: metadataURI,
            transform: function (body) {
              return cheerio.load(body);
            }
          }).then(function ($) {
            PNdetails.script = $(
              "tbody > tr:nth-child(3) > td > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(2) > table:nth-child(22) > tbody > tr:nth-child(3) > td > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(2) > div > table > tbody > tr:nth-child(3) > td > table > tbody > tr > td:nth-child(2) > a"
            ).text();
            PNdetails.language = $(
              "tbody > tr:nth-child(3) > td > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(2) > table:nth-child(22) > tbody > tr:nth-child(3) > td > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(2) > div > table > tbody > tr:nth-child(4) > td > table > tbody > tr > td:nth-child(2) > a"
            ).text();
            download.downloadFromPanjabLibrary(PNdetails, email, documentID);
          });
          break;
      }
    });

    /**
     * The express handler for default routes.
     */
    server.get("*", (req, res) => {
      //book_controller.book_upload();
      return handle(req, res);
    });

    server.post("/download", async (req, res) => {
      res.send({
        error: false,
        message: "You will be mailed with the details soon!"
      });
      download.downloadFromGoogleBooks(
        GoogleBooksQueue,
        req.body.url,
        GBdetails,
        emailaddr
      );
    });

    server.listen(process.env.PORT || 3000, err => {
      if (err) throw err;
      console.log(`> Ready on /:8080`);
    });
  })
  .catch(ex => {
    console.error(ex.stack);
    process.exit(1);
  });
