const express = require('express')
const next = require('next')
const bodyParser = require('body-parser');
const fetch = require('isomorphic-fetch');
const cors = require('cors');
require('dotenv').config();

const dev = process.env.NODE_ENV !== 'production'
const GB_KEY = process.env.GB_KEY;
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare()
.then(() => {
  const server = express()

  // parse application/x-www-form-urlencoded
server.use(bodyParser.urlencoded({ extended: true }))

// parse application/json
server.use(bodyParser.json())

server.use(cors({credentials: true, origin: true}));

  server.get('*', (req, res) => {
    return handle(req, res)
  })

  server.post('/upload', (req, res) => {
    const { bookid,option,email } = req.body;
    switch(option) {
        case 'gb':
            fetch(`https://www.googleapis.com/books/v1/volumes/${bookid}?key=${GB_KEY}`, {
              method : "GET",
              headers: {
                "Content-Type": "application/json"
              }
            })
            .then(response => response.json())
            .then(response => {
              console.log(response);
              const {publicDomain} = response.accessInfo;
              if(publicDomain === false) {
                res.send({error : true, message: "Not in public domain."});
              }
            });
    }
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