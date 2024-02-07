const config = require("../../utils/bullconfig");
const CommonsQueue = config.getNewQueue("commons-queue");
const winston = require("winston");
const {
  downloadFile,
  uploadToCommons,
  uploadToWikiData,
} = require("../../utils/helper");
const logger = winston.loggers.get("defaultLogger");

CommonsQueue.process(async (job, done) => {
  const downloadFileRes = await downloadFile(
    job.data.metadata.uri || job.data.downloadFileURL,
    "commonsFilePayload.pdf"
  );

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
    // return done(new Error(`downloadFile: ${downloadFileRes}`));
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
    // return done(new Error(`uploadToCommons: ${commonsResponse}`));
  }
  const wikiDataResponse = await uploadToWikiData(
    job.data.metadata,
    commonsResponse.filename
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
});
