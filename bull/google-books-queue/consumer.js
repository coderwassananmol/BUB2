const request = require("request");
const EmailProducer = require("../email-queue/producer");
const CommonsProducer = require("../commons-queue/producer");
const config = require("../../utils/bullconfig");
const GoogleBooksQueue = config.getNewQueue("google-books-queue");
const winston = require("winston");
const logger = winston.loggers.get("defaultLogger");
const {
  logUserData,
  uploadToCommons,
  downloadFile,
} = require("./../../utils/helper");

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
});

GoogleBooksQueue.process((job, done) => {
  const requestURI = request(job.data.uri);
  const { id, volumeInfo, accessInfo } = job.data.details;
  const jobLogs = volumeInfo;
  let {
    authors,
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
          "X-archive-meta-title": `uri(${encodeURI(title.trim())})`,
          "X-archive-meta-date": publishedDate.trim(),
          "X-archive-meta-language": language.trim(),
          "X-archive-meta-mediatype": "texts",
          "X-archive-meta-licenseurl":
            "https://creativecommons.org/publicdomain/mark/1.0/",
          "X-archive-meta-publisher": publisher.trim(),
          "X-archive-meta-Author": authors
            ? `uri(${encodeURI(authors.join().trim())})`
            : "",
          "X-archive-meta-rights": accessViewStatus.trim(),
          "X-archive-meta-Google-id": id,
          "X-archive-meta-Source": infoLink.trim(),
        },
      },
      async (error, response, body) => {
        if (error || response.statusCode != 200) {
          const errorMessage = !body ? error : body;
          logger.log({
            level: "error",
            message: `IA Failure GB ${errorMessage}`,
          });
          if (job.data.isEmailNotification === "true") {
            EmailProducer(job.data.userName, title, trueURI, {
              archive: false,
              commons: false,
            });
          }
          done(new Error(errorMessage));
        } else {
          job.progress({
            step: "Upload To IA",
            value: `(${100}%)`,
          });
          if (
            job.data.isUploadCommons !== "true" &&
            job.data.isEmailNotification !== "true"
          ) {
            done(null, true);
          }
          if (
            job.data.isEmailNotification === "true" &&
            job.data.isUploadCommons !== "true"
          ) {
            EmailProducer(job.data.userName, title, trueURI, {
              archive: true,
              commons: false,
            });
          }
          if (job.data.isUploadCommons === "true") {
            job.progress({
              step: "Uploading to Wikimedia Commons",
              value: `(${50}%)`,
            });
            CommonsProducer(null, job.data, async (commonsResponse) => {
              if (commonsResponse.status === true) {
                job.progress({
                  step: "Upload to Wikimedia Commons",
                  value: `(${100}%)`,
                  wikiLinks: {
                    commons: await commonsResponse.value.commons.filename,
                    wikidata:
                      (await commonsResponse.value.wikidata) !== 404
                        ? await commonsResponse.value.wikidata
                        : 404,
                  },
                });
                if (job.data.isEmailNotification === "true") {
                  const commonsLink = `https://commons.wikimedia.org/wiki/File:${commonsResponse.value.filename}`;
                  EmailProducer(
                    job.data.userName,
                    title,
                    { archiveLink: trueURI, commonsLink: commonsLink },
                    { archive: true, commons: true }
                  );
                }
                return done(null, true);
              } else {
                job.progress({
                  step: "Upload To IA (100%), Upload To Commons",
                  value: `(Failed)`,
                });
                if (job.data.isEmailNotification === "true") {
                  EmailProducer(job.data.userName, title, trueURI, {
                    archive: true,
                    commons: false,
                  });
                }
                return done(null, true);
              }
            });
          }
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
    job.progress({
      step: "Uploading to Internet Archive",
      value: `(${Math.round((dataSize / responseSize) * 100)}%)`,
    });
  });
});
