const express = require('express')
const next = require('next')
const bodyParser = require('body-parser');
const fetch = require('isomorphic-fetch');
const cors = require('cors');
const download = require('./utils/download.js');
const compression = require('compression')  
require('dotenv').config();
const os = require("os");
const dev = process.env.NODE_ENV !== 'production'
const GB_KEY = process.env.GB_KEY;
const app = next({ dev })
const handle = app.getRequestHandler()
var emailaddr = '';
const mongoose = require('mongoose');
const mongoDB = process.env.mongoDBURI;
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const book_controller = require('./controller/bookController');

app.prepare()
  .then(() => {
    const server = express();

    //Parse application/x-www-form-urlencoded
    server.use(bodyParser.urlencoded({ extended: true }))

    //Parse application/json
    server.use(bodyParser.json())

    //Enable and use CORS
    server.use(cors({ credentials: true, origin: true }));

    server.use(compression())

    const ans2 = book_controller.book_create_get();

    let details; //This contains the details of the book after we fetch informaton from the API.

    /**
     * Every custom route that we build needs to arrive before the * wildcard.
     * This is necessary because otherwise the server won't recognise the route.
     */

    /**
     * Get the information on the basis of book id that we generate on each book being requested to upload.
     */
    server.get('/upload/:id', (req, res) => {
      const actualPage = '/status';
      let queryParams;
      book_controller.getParticularBook(req.params.id).then(response => {
        queryParams = response;
        app.render(req, res, actualPage, queryParams);
      })      
    })

    server.get('/queue',(req,res) => {
      res.redirect('/queue/1');
    })

    server.get('/queue/:id', (req,res) => {
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
          app.render(req, res, '/queue',queryParams);
        })
      //ans.then(response => res.send(response));
    });

    /**
     * The express handler for default routes.
     */
    server.get('*', (req, res) => {
      //book_controller.book_upload();
      return handle(req, res)
    })

    
    /**
     * This route is called when the user submits the form with book id, option and email.
     */
    server.post('/volumeinfo', (req, res) => {
      const { bookid, option, email } = req.body;
      emailaddr = email;
      switch (option) {
        case 'gb':
          fetch(`https://www.googleapis.com/books/v1/volumes/${bookid}?key=${GB_KEY}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json"
            }
          })
            .then(response => response.json())
            .then(async response => {
              if (response.error) {
                if (response.error.code === 503) { //Google Books error
                  res.send({ error: true, message: response.error.message });
                }
              }
              else {
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
                if (publicDomain === false) { //Checking if the book belongs to publicDomain
                  res.send({ error: true, message: "Not in public domain." });
                }
                else {
                  details = response;
                  res.send({
                    error: false,
                    message: "In public domain.",
                    url: details.accessInfo.pdf.downloadLink,
                    title: details.volumeInfo.title,
                  });
                }
              }
            })
            .catch(error => console.log(error));
      }
    })

    server.post('/download', async (req, res) => {
      res.send({ error: false, message: "You will be mailed with the details soon!" });
      const result = await download.downloadFile(req.body.url, details, emailaddr);
    });

    server.listen(process.env.PORT || 8080, (err) => {
      if (err) throw err
      console.log(`> Ready on /:8080`);
    })
  })
  .catch((ex) => {
    console.error(ex.stack)
    process.exit(1)
  })