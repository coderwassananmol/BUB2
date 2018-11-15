const express = require('express')
const next = require('next')
const bodyParser = require('body-parser');
const fetch = require('isomorphic-fetch');
const cors = require('cors');
const download = require('./utils/download.js');
const scissors = require('scissors');
const fs = require('fs');
require('dotenv').config();

const dev = process.env.NODE_ENV !== 'production'
const GB_KEY = process.env.GB_KEY;
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare()
  .then(() => {
    const server = express();

    //Parse application/x-www-form-urlencoded
    server.use(bodyParser.urlencoded({ extended: true }))

    //Parse application/json
    server.use(bodyParser.json())

    //Enable and use CORS
    server.use(cors({ credentials: true, origin: true }));

    let details; //This contains the details of the book after we fetch informaton from the API.

    server.get('*', (req, res) => {
      return handle(req, res)
    })

    server.post('/volumeinfo', (req, res) => {
      const { bookid, option, email } = req.body;
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
                if (response.error.code === 503) {
                  res.send({ error: true, message: response.error.message });
                }
              }
              else {
                /*await fetch(`https://archive.org/advancedsearch.php?q=${response.id}&fl[]=identifier&output=json`, {
                  method: "GET"
                })
                .then(resp => resp.json())
                .then(resp => {
                  //var pdf = scissors('https://books.googleusercontent.com/books/content?req=AKW5QafdirdktGwfJQzF_qIb62l5OBHaQ--KGur8FbAPGoB8ho3hIj5pamtvriDN0H-hHJ-nIS4jykjMRtcpYB8m8lbvYx9s9YMc5iaMWJ37KbDgGtCz9nmsa4D0VRGdhczf5CdNcwy3Tv1P7Zs_3eHmkSnYjsosnchXbEm0sR1Kv26LQ30SOpMxMDt1KKqIbL3dD8XCkDXrafVbcIADNT6bNjuF8Biq7qwO7kG70Mq59HC5u8c2VFUTmZq3v_Jw23E6p0JRlEewK2x3A_u1_tjo-UnfiUcMAL2Et5gf-5zC_7HUlHwlZfs').pdfStream().pipe(fs.createWriteStream('nope.pdf'));
;                  if(resp.response.numFound == 1) {
                    res.send({ error: false, message: "The document is already available in Internet Archive." });
                  }
                })
                .catch(err => console.log(err))*/
                const { publicDomain } = response.accessInfo; //Response object destructuring
                if (publicDomain === false) {
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
      const result = await download.downloadFile(req.body.url, details); //I don't think it works. Need to check if it actually returns a promise.
      console.log(result);
    })

    server.listen(3000, (err) => {
      if (err) throw err
      console.log('> Ready on http://localhost:3000')
    })
  })
  .catch((ex) => {
    console.error(ex.stack)
    process.exit(1)
  })