const express = require("express");
const next = require("next");
const bodyParser = require("body-parser");
const fetch = require("isomorphic-fetch");
const cors = require("cors");
const download = require("./utils/download.js");
const compression = require("compression");
require("dotenv").config();
const cheerio = require("cheerio"); // Basically jQuery for node.js
const rp = require("request-promise");
const fs = require("fs");
const url = require("url");
const querystring = require("querystring");
const dev = process.env.NODE_ENV !== "production";
const GB_KEY = process.env.GB_KEY;
const app = next({ dev });
const handle = app.getRequestHandler();
var emailaddr = "";
const mongoose = require("mongoose");
const mongoDB = process.env.mongoDBURI;
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

const book_controller = require("./controller/bookController");

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

    let details; //This contains the details of the book after we fetch informaton from the API.

    //const ans2 = book_controller.book_create_get();

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
      book_controller.getParticularBook(req.params.id).then(response => {
        queryParams = response;
        app.render(req, res, actualPage, queryParams);
      });
    });

    server.get("/queue", (req, res) => {
      res.redirect("/queue/1");
    });

    server.get("/queue/:id", (req, res) => {
      /**
       * Slight modification to be done here.
       * @param {Number} page that contains a number which can be used in pagination.
       * Suppose page=1, then fetch the latest 20 entries which implies that each page can
       * get maximum 20 entries.
       * Whenever a request to http://localhost:3000/queue occurs, it by default checks for
       * http://localhost:3000/queue?page=1, else, it checks for ?page parameter.
       * Fetch data for 40 books at once.
       */
      const ans = book_controller.book_create_get(req.params.id);
      let queryParams;
      ans.then(response => {
        queryParams = response.docs;
        queryParams.page = req.params.id;
        app.render(req, res, "/queue", queryParams);
      });
      //ans.then(response => res.send(response));
    });

    /**
     * The express handler for default routes.
     */
    server.get("*", (req, res) => {
      //book_controller.book_upload();
      return handle(req, res);
    });

    /**
     * This route is called when the user submits the form with book id, option and email.
     */
    let GBdetails = {};
    server.post("/volumeinfo", async (req, res) => {
      const { bookid, option, email } = req.body;
      emailaddr = email;
      switch (option) {
        case "gb":
          fetch(
            `https://www.googleapis.com/books/v1/volumes/${bookid}?key=${GB_KEY}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json"
              }
            }
          )
            .then(response => response.json())
            .then(async response => {
              if (response.error) {
                if (response.error.code === 503) {
                  //Google Books error
                  res.send({ error: true, message: response.error.message });
                }
              } else {
                //Checking if the document already exists on Internet Archive

                /*await fetch(`https://archive.org/advancedsearch.php?q=${response.id}&fl[]=identifier&output=json`, {
                  method: "GET"
                })
                .then(resp => resp.json())
                .then(resp => {
;                  if(resp.response.numFound == 1) {
                    res.send({ error: false, message: "The document is already available in Internet Archive." });
                  }
                })
                .catch(err => console.log(err))*/
                const { publicDomain } = response.accessInfo; //Response object destructuring
                if (publicDomain === false) {
                  //Checking if the book belongs to publicDomain
                  res.send({ error: true, message: "Not in public domain." });
                } else {
                  GBdetails = response;
                  res.send({
                    error: false,
                    message: "In public domain.",
                    url: GBdetails.accessInfo.pdf.downloadLink,
                    title: GBdetails.volumeInfo.title
                  });
                }
              }
            })
            .catch(error => console.log(error));
          break;
        case "pn":
        let PNdetails = {};
          var options = {
            uri: bookid,
            transform: function(body) {
              return cheerio.load(body);
            }
          };
          await rp(options)
            .then(async function($) {
              res.send({
                error: false,
                message: "You will be mailed with the details soon!"
              });
              let images = [];
              const no_of_pages = $(
                "form > table > tbody > tr > td > table > tbody > tr > td:nth-child(2) > table > tbody > tr > td:nth-child(1) > table > tbody > tr > td:nth-child(4) > b"
              ).text();
              const iframe = $("iframe").attr("src");
              PNdetails.pages = no_of_pages;
              let parsedUrl = url.parse(bookid);
              let parsedQs = querystring.parse(parsedUrl.query);
              PNdetails.id = parsedQs.ID;
              PNdetails.title = $(
                "body > table > tbody > tr > td:nth-child(2) > table > tbody > tr:nth-child(7) > td > table > tbody > tr > td:nth-child(2) > table > tbody > tr:nth-child(2) > td > table:nth-child(10) > tbody > tr:nth-child(2) > td"
              ).text();
              PNdetails.previewLink = bookid;
              for (let i = 1; i <= no_of_pages; ++i) {
                const str = `http://www.panjabdigilib.org/images?ID=${
                  PNdetails.id
                }&page=${i}&pagetype=null`;
                let error = false;
                console.log(str);
                await rp({
                  method: "GET",
                  uri: str,
                  encoding: null,
                  transform: function(body, response, resolveWithFullResponse) {
                    return { headers: response.headers, data: body };
                  }
                })
                  .then(function(body) {
                    if (/image/.test(body.headers["content-type"])) {
                      var data =
                        "data:" +
                        body.headers["content-type"] +
                        ";base64," +
                        new Buffer(body.data).toString("base64");
                      images.push(data);
                    }
                  })
                  .catch(function(err) {
                    error = true;
                  }).then(function() {
                    if(error) {
                      console.log("i increased");
                    }
                  });
              }
              PNdetails.imageLinks = images;
            })
            .catch(function(err) {
              // Crawling failed or Cheerio choked...
              throw err;
            })

          let metadataURI = bookid.replace("displayPageContent", "displayPage");
          await rp({
            uri: metadataURI,
            transform: function(body) {
              return cheerio.load(body);
            }
          }).then(function($) {
            PNdetails.script = $(
              "tbody > tr:nth-child(3) > td > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(2) > table:nth-child(22) > tbody > tr:nth-child(3) > td > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(2) > div > table > tbody > tr:nth-child(3) > td > table > tbody > tr > td:nth-child(2) > a"
            ).text();
            PNdetails.language = $(
              "tbody > tr:nth-child(3) > td > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(2) > table:nth-child(22) > tbody > tr:nth-child(3) > td > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(2) > div > table > tbody > tr:nth-child(4) > td > table > tbody > tr > td:nth-child(2) > a"
            ).text();
            download.downloadFromPanjabLibrary(PNdetails,email);
          });
          break;
      }
    });

    server.post("/download", async (req, res) => {
      res.send({
        error: false,
        message: "You will be mailed with the details soon!"
      });
      download.downloadFromGoogleBooks(
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
