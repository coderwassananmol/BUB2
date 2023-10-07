const EmailProducer = require("../email-queue/producer");
const config = require("../../utils/bullconfig");
const PDLQueue = config.getNewQueue("pdl-queue");
const rp = require("request-promise");
const request = require("request");
const _ = require("lodash");
const winston = require("winston");
const logger = winston.loggers.get("defaultLogger");
const { logUserData } = require("./../../utils/helper");

var JSZip = require("jszip");
PDLQueue.on("active", (job, jobPromise) => {
  logger.log({
    level: "info",
    message: `Consumer(next): Job ${job.id} is active!`,
  });
});

PDLQueue.on("completed", (job, result) => {
  logger.log({
    level: "info",
    message: `Consumer(next): Job ${job.id} completed! Result: ${result}`,
  });
});

PDLQueue.on("failed", (job, err) => {
  logger.log({
    level: "error",
    message: `Consumer(next): Job ${job.id} failed with error: ${err.message}`,
  });
});

async function getZipAndBytelength(no_of_pages, id, title, job) {
  var zip = new JSZip();
  title = title.replace(/ /g, "_");
  var img = zip.folder(`${title}_images`);
  let temp_pages = no_of_pages;
  var download_image = async function (uri, filename) {
    await rp({
      method: "GET",
      uri,
      encoding: null,
      transform: function (body, response) {
        return { headers: response.headers, data: body };
      },
    })
      .then(async function (body) {
        if (/image/.test(body.headers["content-type"])) {
          var data = new Buffer(body.data);
          img.file(filename, data.toString("base64"), { base64: true });
        }
      })
      .catch(function (err) {
        --no_of_pages;
      });
  };
  for (let i = 1; i <= temp_pages; ++i) {
    const str = `http://www.panjabdigilib.org/images?ID=${id}&page=${i}&pagetype=null&Searched=W3GX`;
    await download_image(str, `${title}_${i}.jpeg`);
    job.progress(Math.round((i / temp_pages) * 82));
  }
  let { byteLength } = await zip.generateAsync({ type: "nodebuffer" });
  byteLength = Number(byteLength + no_of_pages * 16); //No. of pages * 16
  return [zip, byteLength];
}

function setHeaders(metadata, byteLength, title) {
  let headers = {};
  headers[
    "Authorization"
  ] = `LOW ${process.env.access_key}:${process.env.secret_key}`;
  headers["Content-type"] = "application/zip";
  headers["Content-length"] = byteLength;
  headers["X-Amz-Auto-Make-Bucket"] = 1;
  headers["X-Archive-meta-collection"] = "opensource";
  headers["X-Archive-Ignore-Preexisting-Bucket"] = 1;
  headers["X-archive-meta-identifier"] = title;
  headers["X-archive-meta-mediatype"] = "texts";
  headers["X-archive-meta-uploader"] = "bub.wikimedia@gmail.com"; //To be added
  headers["X-archive-meta-contributor"] = "Panjab Digital Library"; //To be added
  headers["X-archive-meta-betterpdf"] = true; //To be added
  headers[
    "X-archive-meta-external-identifier"
  ] = `urn:pdl:${metadata["bookID"]}:${metadata["categoryID"]}`; //To be added
  for (var key in metadata) {
    let meta_key = key.trim().replace(/ /g, "-").toLowerCase();
    headers[`X-archive-meta-${meta_key}`] = metadata[key];
  }
  headers["X-archive-meta-title"] = metadata["title"];
  return headers;
}

async function uploadToIA(zip, metadata, byteLength, email, job) {
  const bucketTitle = metadata.IAIdentifier;
  const IAuri = `http://s3.us.archive.org/${bucketTitle}/${bucketTitle}_images.zip`;
  metadata = _.omit(metadata, "coverImage");
  let headers = setHeaders(metadata, byteLength, metadata.title);
  await zip.generateNodeStream({ type: "nodebuffer", streamFiles: true }).pipe(
    request(
      {
        method: "PUT",
        preambleCRLF: true,
        postambleCRLF: true,
        uri: IAuri,
        headers: headers,
      },
      (error, response, body) => {
        if (response.statusCode === 200) {
          EmailProducer(
            job.data.details.userName,
            metadata.title,
            trueURI,
            true
          );
        } else {
          logger.log({
            level: "error",
            message: `IA Failure PDL ${body}`,
          });
          EmailProducer(
            job.data.details.userName,
            metadata.title,
            trueURI,
            false
          );
        }
      }
    )
  );
}

PDLQueue.process(async (job, done) => {
  const jobLogs = job.data.details;
  const trueURI = `http://archive.org/details/${job.data.details.IAIdentifier}`;
  jobLogs["trueURI"] = trueURI;
  jobLogs["userName"] = job.data.details.userName;
  job.log(JSON.stringify(jobLogs));
  logUserData(jobLogs["userName"], "Panjab Digital Library");
  const [zip, byteLength] = await getZipAndBytelength(
    job.data.details.Pages,
    job.data.details.bookID,
    job.data.details.title,
    job
  );
  job.progress(90);
  await uploadToIA(
    zip,
    job.data.details,
    byteLength,
    job.data.details.email,
    job
  );
  job.progress(100);
  done(null, true);
});
