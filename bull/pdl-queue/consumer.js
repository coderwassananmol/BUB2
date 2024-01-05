const EmailProducer = require("../email-queue/producer");
const CommonsProducer = require("../commons-queue/producer");
const config = require("../../utils/bullconfig");
const PDLQueue = config.getNewQueue("pdl-queue");
const rp = require("request-promise");
const request = require("request");
const _ = require("lodash");
const winston = require("winston");
const logger = winston.loggers.get("defaultLogger");
const {
  logUserData,
  downloadFile,
  uploadToCommons,
  convertZipToPdf,
} = require("./../../utils/helper");
const { customFetch } = require("../../utils/helper");
const { Readable } = require("stream");

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

async function getZipAndBytelength(no_of_pages, id, title, job) {
  var zip = new JSZip();
  title = title.replace(/ /g, "_");
  var img = zip.folder(`${title}_images`);
  let temp_pages = no_of_pages;
  let downloadImageStatus;
  let errorFlag = { status: false, page: "" };
  var download_image = async function (uri, filename) {
    try {
      const body = await rp({
        method: "GET",
        uri,
        encoding: null,
        transform: function (body, response) {
          return { headers: response.headers, data: body };
        },
      });
      if (/image/.test(body.headers["content-type"])) {
        var data = new Buffer(body.data);
        img.file(filename, data.toString("base64"), { base64: true });
      }
      return 200;
    } catch (err) {
      --no_of_pages;
      return err.statusCode;
    }
  };
  for (let i = 1; i <= temp_pages; ++i) {
    const str = `http://www.panjabdigilib.org/images?ID=${id}&page=${i}&pagetype=null&Searched=W3GX`;
    downloadImageStatus = await download_image(str, `${title}_${i}.jpeg`);
    job.progress({
      step: "Uploading to Internet Archive",
      value: `(${Math.round((i / temp_pages) * 82)}%)`,
    });
    if (downloadImageStatus >= 200 && downloadImageStatus < 300) {
      continue;
    } else {
      errorFlag = { status: true, page: str };
      break;
    }
  }
  let { byteLength } = await zip.generateAsync({ type: "nodebuffer" });
  byteLength = Number(byteLength + no_of_pages * 16); //No. of pages * 16
  return [zip, byteLength, errorFlag];
}

async function getPdfAndBytelength(pdfUrl, job) {
  try {
    let errorFlag = { status: false, page: "" };
    const response = await customFetch(
      pdfUrl,
      "GET",
      new Headers({
        "Content-Type": "application/pdf",
      }),
      "file"
    );
    if (response.status === 200) {
      job.progress({
        step: "Uploading to Internet Archive",
        value: `(${30}%)`,
      });
      const buffer = await response.buffer();
      job.progress({
        step: "Uploading to Internet Archive",
        value: `(${60}%)`,
      });
      return {
        pdfBuffer: buffer,
        byteLength: buffer.byteLength,
        errorFlag,
      };
    } else {
      logger.log({
        level: "error",
        message: `Failure PDL: Failed to download PDF. Status Code: ${response.status}`,
      });
      errorFlag = { status: true, page: pdfUrl };
      return {
        pdfBuffer: null,
        byteLength: null,
        errorFlag,
      };
    }
  } catch (error) {
    logger.log({
      level: "error",
      message: `Failure PDL: ${error}`,
    });
    let errorFlag = { status: true, page: pdfUrl };
    return {
      pdfBuffer: null,
      byteLength: null,
      errorFlag,
    };
  }
}

function setHeaders(metadata, byteLength, title, contentType) {
  let headers = {};
  headers[
    "Authorization"
  ] = `LOW ${process.env.access_key}:${process.env.secret_key}`;
  headers["Content-type"] = `application/${contentType}`;
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
  headers[`X-archive-meta-description`] = `uri(${encodeURI(
    metadata.description?.trim()
  )})`;
  return headers;
}

async function uploadZipToIA(
  zip,
  metadata,
  byteLength,
  email,
  job,
  onError,
  trueURI
) {
  const bucketTitle = metadata.IAIdentifier;
  const IAuri = `http://s3.us.archive.org/${bucketTitle}/${bucketTitle}_images.zip`;
  metadata = _.omit(metadata, "coverImage");
  let headers = setHeaders(
    metadata,
    byteLength,
    metadata.title,
    job.data.details.contentType
  );
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
          if (metadata.isEmailNotification === "true") {
            EmailProducer(metadata.userName, metadata.title, trueURI, true);
          }
          onError(false, null);
        } else {
          const errorMessage = !body ? error : body;
          logger.log({
            level: "error",
            message: `IA Failure PDL ${errorMessage}`,
          });
          if (metadata.isEmailNotification === "true") {
            EmailProducer(metadata.userName, metadata.title, trueURI, false);
          }
          onError(true, errorMessage);
        }
      }
    )
  );
}

async function uploadPdfToIA(
  pdfBuffer,
  metadata,
  byteLength,
  email,
  job,
  onError,
  trueURI
) {
  const bucketTitle = metadata.IAIdentifier;
  const IAuri = `http://s3.us.archive.org/${bucketTitle}/${bucketTitle}.pdf`;
  let headers = setHeaders(
    metadata,
    byteLength,
    metadata.title,
    job.data.details.contentType
  );
  const options = {
    method: "PUT",
    uri: IAuri,
    headers: headers,
  };
  const readableStream = Readable.from(pdfBuffer);
  readableStream.pipe(
    request(options, (error, response, body) => {
      if (response.statusCode === 200) {
        if (metadata.isEmailNotification === "true") {
          EmailProducer(metadata.userName, metadata.title, trueURI, true);
        }
        onError(false, null);
      } else {
        logger.log({
          level: "error",
          message: `IA Failure PDL ${body || error}`,
        });
        if (metadata.isEmailNotification === "true") {
          EmailProducer(metadata.userName, metadata.title, trueURI, false);
        }
        onError(true, body || error);
      }
    })
  );
}

PDLQueue.process(async (job, done) => {
  try {
    const jobLogs = job.data.details;
    const trueURI = `http://archive.org/details/${job.data.details.IAIdentifier}`;
    jobLogs["trueURI"] = trueURI;
    jobLogs["userName"] = job.data.details.userName;
    job.log(JSON.stringify(jobLogs));
    logUserData(jobLogs["userName"], "Panjab Digital Library");

    if (job.data.details.pdfUrl) {
      const { pdfBuffer, byteLength, errorFlag } = await getPdfAndBytelength(
        job.data.details.pdfUrl,
        job
      );
      if (errorFlag.status) {
        logger.log({
          level: "error",
          message: `Failure PDL: Failed to download ${errorFlag.page}`,
        });
        done(new Error(`Failure PDL: Failed to download ${errorFlag.page}`));
      }
      await uploadPdfToIA(
        pdfBuffer,
        job.data.details,
        byteLength,
        job.data.details.email,
        job,
        (isError, error) => {
          if (isError) {
            logger.log({
              level: "error",
              message: `IA Failure PDL: ${error}`,
            });
            if (job.data.details.isEmailNotification === "true") {
              EmailProducer(
                job.data.details.userName,
                job.data.details.title,
                trueURI,
                false
              );
            }
            done(new Error(error));
          } else {
            job.progress({
              step: "Uploading to Internet Archive",
              value: `(${100}%)`,
            });
          }
        },
        trueURI
      );
      if (job.data.details.isUploadCommons === "true") {
        job.progress({
          step: "Uploading to Wikimedia Commons",
          value: `(${50}%)`,
        });
        CommonsProducer(null, null, job.data.details, (commonsResponse) => {
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
        });
      }
      if (job.data.details.isEmailNotification === "true") {
        EmailProducer(
          job.data.details.userName,
          job.data.details.title,
          trueURI,
          true
        );
      }
      return done(null, true);
    } else {
      const [zip, byteLength, errorFlag] = await getZipAndBytelength(
        job.data.details.Pages,
        job.data.details.bookID,
        job.data.details.title,
        job
      );
      if (errorFlag.status) {
        logger.log({
          level: "error",
          message: `Failure PDL: Failed to download ${errorFlag.page}`,
        });
        done(new Error(`Failure PDL: Failed to download ${errorFlag.page}`));
      }
      job.progress({
        step: "Uploading to Internet Archive",
        value: `(${90}%)`,
      });
      await uploadZipToIA(
        zip,
        job.data.details,
        byteLength,
        job.data.details.email,
        job,
        async (isError, error) => {
          if (isError) {
            if (job.data.details.isEmailNotification === "true") {
              logger.log({
                level: "error",
                message: `IA Failure PDL: ${error}`,
              });
              EmailProducer(
                job.data.details.userName,
                job.data.details.title,
                trueURI,
                false
              );
            }
            done(new Error(error));
          } else {
            job.progress({
              step: "Uploading to Internet Archive",
              value: `(${100}%)`,
            });
            if (job.data.details.isUploadCommons === "true") {
              job.progress({
                step: "Uploading to Wikimedia Commons",
                value: `(${50}%)`,
              });
              const base64Zip = await zip.generateAsync({ type: "base64" });
              CommonsProducer(
                "pdlZip",
                base64Zip,
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
            if (job.data.details.isEmailNotification === "true") {
              EmailProducer(
                job.data.details.userName,
                job.data.details.title,
                trueURI,
                true
              );
            }
            return done(null, true);
          }
        },
        trueURI
      );
    }
  } catch (error) {
    logger.log({
      level: "error",
      message: `Failure PDL Queue: ${error}`,
    });
    done(new Error(error));
  }
});
