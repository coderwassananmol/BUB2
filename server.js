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
const url = require("url");
const querystring = require("querystring");
const dev = process.env.NODE_ENV !== "production";
const GB_KEY = process.env.GB_KEY;
const app = next({ dev });
const handle = app.getRequestHandler();
const bookController = require("./controller/bookController");
var emailaddr = "";
const mongoose = require("mongoose");
const mongoDB = process.env.mongoDBURI;
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

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
      bookController.getParticularBook(req.params.id).then(response => {
        queryParams = response;
        app.render(req, res, actualPage, queryParams);
      });
    });

    /**
     * Redirect to the first page of the queue.
     * /queue should directly lead to /queue/1
     * If an ID is specified separately, it will go the next API.
     */
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
      try {
        const ans = bookController.book_create_get(req.params.id);
        let queryParams; //The variable that will hold the data
        ans.then(response => {
          if(typeof response === 'object' && "docs" in response) {
            queryParams = response.docs;
            queryParams.page = req.params.id;
            app.render(req, res, "/queue", queryParams);
          }
          else {
            res.redirect('/')
          }
        });
      }
      catch(err) {
        res.redirect('/')
      }
      //ans.then(response => res.send(response));
    });
    
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
                let isPresent = false
                await fetch(`https://archive.org/advancedsearch.php?q=${response.id}&fl[]=identifier&output=json`, {
                  method: "GET"
                })
                .then(resp => resp.json())
                .then(resp => {
;                  if(resp.response.numFound !== 0) {
                    isPresent = true;
                  }
                })
                .catch(err => console.log(err))
                
                //Checking if the book is already present in the database with status "Uploading" or "Successful"
                bookController.getParticularBook(response.id).then(response => {
                  console.log(response)
                });

                if(isPresent) {
                  res.send({ error: true, message: "The document is already available in Internet Archive." });
                }
                else {
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
              }
            })
            .catch(error => {
              console.log("Error is here")
              console.log(error);
              res.send({
                error: true,
                message: "There was some error fetching that document from Google Books."
              })
            });
          break;
        case "pn":
          let PNdetails = {};
          let documentID = '';
          var options = {
            uri: bookid,
            transform: function(body) {
              return cheerio.load(body);
            }
          };
          await rp(options)
            .then(async function($) {
              let images = [];
              const no_of_pages = $(
                "form > table > tbody > tr > td > table > tbody > tr > td:nth-child(2) > table > tbody > tr > td:nth-child(1) > table > tbody > tr > td:nth-child(4) > b"
              ).text();
              PNdetails.pages = no_of_pages;
              let parsedUrl = url.parse(bookid);
              let parsedQs = querystring.parse(parsedUrl.query);
              PNdetails.id = parsedQs.ID;
              PNdetails.title = $(
                "body > table > tbody > tr > td:nth-child(2) > table > tbody > tr:nth-child(7) > td > table > tbody > tr > td:nth-child(2) > table > tbody > tr:nth-child(2) > td > table:nth-child(10) > tbody > tr:nth-child(2) > td"
              ).text();
              PNdetails.previewLink = bookid;
              res.send({
                error: false,
                message: "You will be mailed with the details soon!"
              });
              for (let i = 1; i <= no_of_pages; ++i) {
                const str = `http://www.panjabdigilib.org/images?ID=${
                  PNdetails.id
                }&page=${i}&pagetype=null&Searched=W3GX`;
                await rp({
                  method: "GET",
                  uri: str,
                  encoding: null,
                  transform: function(body, response) {
                    return { headers: response.headers, data: body };
                  }
                })
                  .then(async function(body) {
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
                    console.log(err)
                  })
              }
              PNdetails.imageLinks = images;
            })
            .catch(function(err) {
              // Crawling failed or Cheerio choked...
              res.send({
                error: true,
                message: "Invalid URL."
              })
              console.log(err)
            })

            bookController.createBookMinimal(
              PNdetails.id,
              PNdetails.imageLinks[0],
              PNdetails.previewLink,
              PNdetails.title,
              `http://archive.org/details/bub_pn_${PNdetails.id}`,
              "Uploading",
            ).then(id => {
              documentID = id
            });

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
            download.downloadFromPanjabLibrary(PNdetails,email,documentID);
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
