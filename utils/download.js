const request = require("request");
const nodemailer = require("nodemailer");
const emailtemp = require("./email.js");
const bookController = require("../controller/bookController");
const PDFDocument = require("pdfkit");
const fs = require("fs");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.email,
    pass: process.env.password
  }
});
module.exports = {
  downloadFromGoogleBooks: (uri, details, email) => {
    const requestURI = request(uri);
    let statusText = "Uploading";
    let documentID;
    const { id, volumeInfo, accessInfo } = details;
    const {
      publisher,
      publishedDate,
      imageLinks,
      previewLink,
      title,
      language,
      accessViewStatus,
      pageCount,
      infoLink
    } = volumeInfo;
    const { pdf } = accessInfo;
    const IAuri = `http://s3.us.archive.org/bub_gb_${id}/bub_gb_${id}.pdf`;
    const trueURI = `http://archive.org/details/bub_gb_${id}`;
    bookController.createBook(
      id,
      publisher,
      pdf.downloadLink,
      publishedDate,
      imageLinks.thumbnail,
      previewLink,
      title,
      trueURI,
      statusText,
      function(id) {
        documentID = id;
      }
    );
    requestURI.pipe(
      request(
        {
          method: "PUT",
          preambleCRLF: true,
          postambleCRLF: true,
          uri: IAuri,
          headers: {
            Authorization: `LOW ${process.env.access_key}:${
              process.env.secret_key
            }`,
            "Content-type": "application/pdf; charset=utf-8",
            "Accept-Charset": "utf-8",
            "X-Amz-Auto-Make-Bucket": "1",
            "X-Archive-Meta-Collection": "opensource",
            "X-Archive-Ignore-Preexisting-Bucket": 1,
            "X-archive-meta-title": title,
            "X-archive-meta-date": publishedDate,
            "X-archive-meta-language": language,
            "X-archive-meta-mediatype": "text",
            "X-archive-meta-licenseurl":
              "https://creativecommons.org/publicdomain/mark/1.0/",
            "X-archive-meta-publisher": publisher,
            "X-archive-meta-rights": accessViewStatus,
            "X-archive-meta-Google-id": id,
            "X-archive-meta-Identifier": `bub_gb_${id}`,
            "X-archive-meta-Pages": pageCount,
            "X-archive-meta-Source": infoLink
          }
        },
        (error, response, body) => {
          if (error || response.statusCode != 200) {
            console.error(error);
            console.error(response);
            statusText = "Error";
            bookController.updateBook(statusText, documentID);
            if (email != "") {
              const mailOptions = {
                from: "bub.wikimedia@gmail.com", // sender address
                to: email, // list of receivers
                subject: 'BUB File Upload - "Error"', // Subject line
                html: emailtemp.emailtemplate(title, statusText, trueURI) // plain text body
              };

              transporter.sendMail(mailOptions, function(err, info) {
                if (err) throw err;
              });
            }
          } else {
            statusText = "Successful";
            bookController.updateBook(statusText, documentID);
            if (email != "") {
              const mailOptions = {
                from: "bub.wikimedia@gmail.com", // sender address
                to: email, // list of receivers
                subject: 'BUB File Upload - "Successful"', // Subject line
                html: emailtemp.emailtemplate(title, statusText, trueURI) // plain text body
              };
              transporter.sendMail(mailOptions, function(err, info) {
                if (err) throw err;
              });
            }
          }
        }
      )
    );
  },
  downloadFromPanjabLibrary: (details,email, documentID) => {
    const {
      id,
      title,
      previewLink,
      script,
      language,
      pages,
      imageLinks
    } = details;
    let statusText = "Uploading";
    const IAuri = `http://s3.us.archive.org/bub_pn_${id}/bub_pn_${id}.pdf`;
    const trueURI = `http://archive.org/details/bub_pn_${id}`;
    const doc = new PDFDocument;
    bar1.start(100, 0);
    for (var i = 0; i < imageLinks.length; i++) {
      doc.image(imageLinks[i], { width:500, height:600, align: "center" });
      i !== imageLinks.length - 1 ? doc.addPage() : null;
    }
    doc.end();
    new Promise(async (resolve, reject) => {
      doc.pipe(fs.createWriteStream(`output${id}.pdf`)).on("finish", () => {
        fs.stat(`output${id}.pdf`, (err, stat) => {
          if (err) reject({ error: true });
          resolve(stat.size);
        });
      });
    }).then(value => {
      
      fs.createReadStream(`output${id}.pdf`).pipe(
        request(
          {
            method: "PUT",
            preambleCRLF: true,
            postambleCRLF: true,
            uri: IAuri,
            headers: {
              Authorization: `LOW ${process.env.access_key}:${
                process.env.secret_key
              }`,
              "Content-type": "application/pdf; charset=utf-8",
              "Content-length": value,
              "Accept-Charset": "utf-8",
              "X-Amz-Auto-Make-Bucket": "1",
              "X-Archive-Meta-Collection": "opensource",
              "X-Archive-Ignore-Preexisting-Bucket": 1,
              "X-archive-meta-title": title,
              "X-archive-meta-language": language,
              "X-archive-meta-mediatype": "image",
              "X-archive-meta-licenseurl":
                "https://creativecommons.org/publicdomain/mark/1.0/",
              "X-archive-meta-publisher": "Punjab Digital Library",
              "X-archive-meta-rights": "public",
              "X-archive-meta-identifier": `bub_pn_${id}`,
              "X-archive-meta-pages": pages,
              "X-archive-meta-script": script,
              "X-archive-meta-source": "Punjab Digital Library"
            }
          },
          (error, response, body) => {
            //fs.unlink(`output${id}.pdf`, err => console.log(err));
            bar1.stop()
            if (error) {
              statusText = "Error";
              bookController.updateBook(statusText, documentID);
              console.log(error);
              if (email != "") {
                const mailOptions = {
                  from: "bub.wikimedia@gmail.com", // sender address
                  to: email, // list of receivers
                  subject: 'BUB File Upload - "Error"', // Subject line
                  html: emailtemp.emailtemplate(title, statusText, trueURI) // plain text body
                };

                transporter.sendMail(mailOptions, function(err, info) {
                  if (err) throw err;
                });
              }
            } else {
              statusText = "Successful";
              bookController.updateBook(statusText, documentID);
              if (email != "") {
                const mailOptions = {
                  from: "bub.wikimedia@gmail.com", // sender address
                  to: email, // list of receivers
                  subject: 'BUB File Upload - "Successful"', // Subject line
                  html: emailtemp.emailtemplate(title, statusText, trueURI) // plain text body
                };

                transporter.sendMail(mailOptions, function(err, info) {
                  if (err) throw err;
                });
              }
            }
          }
        )
      );
    });
  }
};
