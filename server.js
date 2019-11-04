#!/usr/bin/env node
const express = require("express");
const next = require("next");
const bodyParser = require("body-parser");
const cors = require("cors");
const compression = require("compression");
require("dotenv").config();
const dev = process.env.NODE_ENV !== "production";
const GB_KEY = process.env.GB_KEY;
const app = next({
  dev
});
const handle = app.getRequestHandler();
const bookController = require("./controller/bookController");
var emailaddr = "";
const {
  customFetch
} = require('./utils/helper.js');
const {
  checkForDuplicatesFromIA
} = require('./utils/helper.js');
const {
  checkForPublicDomain
} = require('./controller/GB');
const Arena = require('bull-arena');
const GoogleBooksProducer = require('./bull/google-books-queue/producer');
const PDLProducer = require('./bull/pdl-queue/producer')

app
  .prepare()
  .then(() => {
    const server = express();

    //Parse application/x-www-form-urlencoded
    server.use(bodyParser.urlencoded({
      extended: true
    }));

    //Parse application/json
    server.use(bodyParser.json());

    //Enable and use CORS
    server.use(cors({
      credentials: true,
      origin: true
    }));

    server.use(compression());

    const arenaConfig = Arena({
      queues: [{
        // Name of the bull queue, this name must match up exactly with what you've defined in bull.
        name: "google-books-queue",

        // Redis auth.
        redis: {
          port: '6379',
          host: '127.0.0.1',
        },
      }]
    }, {
        // Make the arena dashboard become available at {my-site.com}/arena.
        basePath: '/queue',

        // Let express handle the listening.
        disableListen: true
      });

    server.use(arenaConfig)


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
      const {
        bookid,
        option,
        email
      } = req.query;
      emailaddr = email;
      switch (option) {
        case "gb":
          customFetch(`https://www.googleapis.com/books/v1/volumes/${bookid}?key=${GB_KEY}`, 'GET', new Headers({
            "Content-Type": "application/json"
          }))
            .then(data => {
              const {
                error
              } = checkForPublicDomain(data, res)
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
            else {
              const {
                categoryID
              } = req.query;
              res.send({
                error: false,
                message: "You will be mailed with the details soon!"
              });
              PDLProducer(bookid, categoryID, email)
            }
          })
          break;
      }
    });

    /**
     * The express handler for default routes.
     */
    server.get("*", (req, res) => {
      return handle(req, res);
    });

    server.post("/download", async (req, res) => {
      res.send({
        error: false,
        message: "You will be mailed with the details soon!"
      });

      GoogleBooksProducer(req.body.url, GBdetails, emailaddr);
      // download.downloadFromGoogleBooks(
      //   req.body.url,
      //   GBdetails,
      //   emailaddr
      // );
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