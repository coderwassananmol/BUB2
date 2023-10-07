const request = require("request");
const EmailProducer = require("../email-queue/producer");
const config = require("../../utils/bullconfig");
const GoogleBooksQueue = config.getNewQueue("google-books-queue");
const winston = require("winston");
const logger = winston.loggers.get("defaultLogger");
const { logUserData } = require("./../../utils/helper");
const mediawikiEmail = require("./../../utils/mediawikiEmail");

let responseSize,
  dataSize = 0;

GoogleBooksQueue.on("active", (job, jobPromise) => {
  logger.log({
    level: "info",
    message: `Consumer(next): Job ${job.id} is active!`,
  });
});

GoogleBooksQueue.on("completed", (job, result) => {
  logger.log({
    level: "info",
    message: `Consumer(next): Job ${job.id} completed! Result: ${result}`,
  });
  mediawikiEmail(
    job.data.userName,
    "Status Update - Your Google Books has been successfully uploaded to internet archive"
  );
});

GoogleBooksQueue.on("failed", (job, err) => {
  logger.log({
    level: "error",
    message: `Consumer(next): Job ${job.id} failed with error: ${err.message}`,
  });
  mediawikiEmail(
    job.data.userName,
    `Status Update - Your Google Books failed to upload because - ${err.message}`
  );
});

GoogleBooksQueue.process((job, done) => {
  const requestURI = request(job.data.uri);
  const { id, volumeInfo, accessInfo } = job.data.details;
  const jobLogs = volumeInfo;
  let {
    publisher,
    publishedDate,
    imageLinks,
    previewLink,
    title,
    language,
    pageCount,
    infoLink,
  } = volumeInfo;
  const { accessViewStatus } = accessInfo;
  const bucketTitle = job.data.IAIdentifier;
  const IAuri = `http://s3.us.archive.org/${bucketTitle}/${bucketTitle}.pdf`;
  const trueURI = `http://archive.org/details/${bucketTitle}`;
  jobLogs["trueURI"] = trueURI;
  jobLogs["userName"] = job.data.userName;
  job.log(JSON.stringify(jobLogs));
  logUserData(jobLogs["userName"], "Google Books");
  requestURI.pipe(
    request(
      {
        method: "PUT",
        preambleCRLF: true,
        postambleCRLF: true,
        uri: IAuri,
        headers: {
          Authorization: `LOW ${process.env.access_key}:${process.env.secret_key}`,
          "Content-type": "application/pdf; charset=utf-8",
          "Accept-Charset": "utf-8",
          "X-Amz-Auto-Make-Bucket": "1",
          "X-Archive-Meta-Collection": "opensource",
          "X-Archive-Ignore-Preexisting-Bucket": 1,
          "X-archive-meta-title": title.trim(),
          "X-archive-meta-date": publishedDate.trim(),
          "X-archive-meta-language": language.trim(),
          "X-archive-meta-mediatype": "texts",
          "X-archive-meta-licenseurl":
            "https://creativecommons.org/publicdomain/mark/1.0/",
          "X-archive-meta-publisher": publisher.trim(),
          "X-archive-meta-rights": accessViewStatus.trim(),
          "X-archive-meta-Google-id": id,
          "X-archive-meta-Identifier": `bub_gb_${id}`,
          "X-archive-meta-Source": infoLink.trim(),
        },
      },
      async (error, response, body) => {
        if (error || response.statusCode != 200) {
          logger.log({
            level: "error",
            message: `IA Failure GB ${body}`,
          });
          done(new Error(body));
          //EmailProducer(job.data.email, title, trueURI, false);
        } else {
          done(null, true);
          //EmailProducer(job.data.email, title, trueURI, true);
        }
      }
    )
  );

  requestURI.on("response", function (data) {
    responseSize = Number(data.headers["content-length"]);
    dataSize = 0;
  });

  requestURI.on("data", function (chunk) {
    dataSize += Number(chunk.length);
    job.progress(Math.round((dataSize / responseSize) * 100));
  });
});
