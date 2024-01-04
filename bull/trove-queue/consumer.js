const EmailProducer = require("../email-queue/producer");
const CommonsProducer = require("../commons-queue/producer");
const config = require("../../utils/bullconfig");
const TroveQueue = config.getNewQueue("trove-queue");
const rp = require("request-promise");
const request = require("request");
const _ = require("lodash");
const winston = require("winston");
const logger = winston.loggers.get("defaultLogger");
const {
  logUserData,
  downloadFile,
  uploadToCommons,
} = require("./../../utils/helper");

let responseSize,
  dataSize = 0;

TroveQueue.on("active", (job, jobPromise) => {
  logger.log({
    level: "info",
    message: `Consumer(next): Job ${job.id} is active!`,
  });
});

TroveQueue.on("completed", (job, result) => {
  logger.log({
    level: "info",
    message: `Consumer(next): Job ${job.id} completed! Result: ${result}`,
  });
});

TroveQueue.process((job, done) => {
  const currentTimestamp = Date.now();
  request(
    `https://trove.nla.gov.au/newspaper/rendition/nla.news-issue${job.data.details.issueRenditionId}/prep?_=${currentTimestamp}`,
    {},
    async (error, response, body) => {
      if (error || response.statusCode != 200) {
        logger.log({
          level: "error",
          message: `trove API ${body}`,
        });
      } else {
        const requestURI = request(
          `https://trove.nla.gov.au/newspaper/rendition/nla.news-issue${job.data.details.issueRenditionId}.pdf?followup=${body}`
        );
        const downloadFileUrl = `https://trove.nla.gov.au/newspaper/rendition/nla.news-issue${job.data.details.issueRenditionId}.pdf?followup=${body}`;
        const jobLogs = job.data.details;
        let {
          name,
          date,
          id,
          troveUrl,
          IAIdentifier,
          userName,
          isEmailNotification,
        } = job.data.details;
        const bucketTitle = IAIdentifier;
        const IAuri = `http://s3.us.archive.org/${bucketTitle}/${bucketTitle}.pdf`;
        const trueURI = `http://archive.org/details/${bucketTitle}`;
        jobLogs["trueURI"] = trueURI;
        jobLogs["userName"] = job.data.details.userName;
        job.log(JSON.stringify(jobLogs));
        logUserData(jobLogs["userName"], "Trove");
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
                "Content-Length": responseSize,
                "Accept-Charset": "utf-8",
                "X-Amz-Auto-Make-Bucket": "1",
                "X-Archive-Meta-Collection": "opensource",
                "X-Archive-Ignore-Preexisting-Bucket": 1,
                "X-archive-meta-title": name.trim(),
                "X-archive-meta-date": date.trim(),
                "X-archive-meta-mediatype": "texts",
                "X-archive-meta-licenseurl":
                  "https://creativecommons.org/publicdomain/mark/1.0/",
                "X-archive-meta-Trove-issueid": id,
                "X-archive-meta-Identifier": `bub_trove_${id}`,
                "X-archive-meta-TroveURL": troveUrl,
              },
            },
            async (error, response, body) => {
              if (error || response.statusCode != 200) {
                const errorMessage = !body ? error : body;
                logger.log({
                  level: "error",
                  message: `IA Failure Trove ${errorMessage}`,
                });
                if (isEmailNotification === "true") {
                  EmailProducer(userName, name, trueURI, false);
                }
                done(new Error(errorMessage));
              } else {
                if (job.data.details.isUploadCommons === "true") {
                  job.progress({
                    step: "Uploading to Wikimedia Commons",
                    value: `(${50}%)`,
                  });
                  CommonsProducer(
                    downloadFileUrl,
                    job.data.details,
                    (commonsResponse) => {
                      if (commonsResponse.status === true) {
                        job.progress({
                          step: "Upload to Wikimedia Commons",
                          value: `(${100}%)`,
                          wikiLinks: {
                            commons: commonsResponse.filename,
                          },
                        });
                      } else {
                        job.progress({
                          step: "Upload To IA (100%), Upload To Commons",
                          value: `(Failed)`,
                        });
                      }
                    }
                  );
                }
                if (isEmailNotification === "true") {
                  EmailProducer(userName, name, trueURI, true);
                }
                done(null, true);
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
          const progress = Math.round((dataSize / responseSize) * 100);
          if (progress !== null)
            job.progress({
              step: "Uploading to Internet Archive",
              value: `(${progress || 0}%)`,
            });
        });
      }
    }
  );
});
