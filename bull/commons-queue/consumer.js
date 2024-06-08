const config = require("../../utils/bullconfig");
const CommonsQueue = config.getNewQueue("commons-queue");
const winston = require("winston");
const {
  downloadFile,
  uploadToCommons,
  uploadToWikiData,
  convertZipToPdf,
} = require("../../utils/helper");
const JSZip = require("jszip");
const logger = winston.loggers.get("defaultLogger");

CommonsQueue.process(async (job, done) => {
  try {
    if (job.data.type === "pdlZip") {
      const zipBuffer = Buffer.from(job.data.downloadFileURL, "base64");
      const zip = await JSZip.loadAsync(zipBuffer);
      const convertZipToPdfRes = await convertZipToPdf(
        zip,
        "commonsFilePayload.pdf"
      );
      if (convertZipToPdfRes.status !== 200) {
        logger.log({
          level: "error",
          message: `convertZipToPdfRes: ${JSON.stringify(convertZipToPdfRes)}`,
        });
        process.emit("commonsJobComplete", {
          status: false,
          value: null,
        });
        return done(null, true);
      }
      const commonsResponse = await uploadToCommons(job.data.metadata);

      if (commonsResponse.fileUploadStatus !== 200) {
        logger.log({
          level: "error",
          message: `uploadToCommons: ${commonsResponse}`,
        });
        process.emit(`commonsJobComplete:${job.id}`, {
          status: false,
          value: null,
        });
        return done(null, true);
      }
      process.emit(`commonsJobComplete:${job.id}`, {
        status: true,
        value: commonsResponse,
      });
      return done(null, true);
    } else {
      const url =
        job.data?.metadata?.uri ||
        job.data?.downloadFileURL?.uri ||
        job.data?.metadata?.pdfUrl;
      const downloadFileRes = await downloadFile(url, "commonsFilePayload.pdf");

      if (downloadFileRes.writeFileStatus !== 200) {
        logger.log({
          level: "error",
          message: `downloadFile: ${downloadFileRes}`,
        });
        process.emit(`commonsJobComplete:${job.id}`, {
          status: false,
          value: null,
        });
        return done(null, true);
      }
      const commonsResponse = await uploadToCommons(job.data.metadata);

      if (commonsResponse.fileUploadStatus !== 200) {
        logger.log({
          level: "error",
          message: `uploadToCommons: ${commonsResponse}`,
        });
        process.emit(`commonsJobComplete:${job.id}`, {
          status: false,
          value: null,
        });
        return done(new Error(commonsResponse));
      }
      const wikiDataResponse = await uploadToWikiData(
        job.data.metadata,
        commonsResponse.filename,
        job.data.libraryName
      );
      if (wikiDataResponse !== 404) {
        process.emit(`commonsJobComplete:${job.id}`, {
          status: true,
          value: {
            commons: commonsResponse,
            wikidata: wikiDataResponse,
          },
        });
      } else {
        process.emit(`commonsJobComplete:${job.id}`, {
          status: true,
          value: {
            commons: commonsResponse,
            wikidata: 404,
          },
        });
      }
      return done(null, true);
    }
  } catch (error) {
    logger.log({
      level: "error",
      message: err,
    });
    console.log(error, "::errorCommonsQueue");
  }
});
