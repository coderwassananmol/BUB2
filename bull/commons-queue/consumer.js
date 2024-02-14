const config = require("../../utils/bullconfig");
const CommonsQueue = config.getNewQueue("commons-queue");
const winston = require("winston");
const {
  downloadFile,
  uploadToCommons,
  uploadToWikiData,
  uploadToWikiSource,
} = require("../../utils/helper");

CommonsQueue.process(async (job, done) => {
  const downloadFileRes = await downloadFile(
    job.data.metadata.uri || job.data.downloadFileURL,
    "commonsFilePayload.pdf"
  );

  if (downloadFileRes.writeFileStatus !== 200) {
    process.emit(`commonsJobComplete:${job.id}`, {
      status: false,
      value: null,
    });
    return done(null, true);
  }
  const commonsResponse = await uploadToCommons(job.data.metadata);

  if (commonsResponse.fileUploadStatus !== 200) {
    process.emit(`commonsJobComplete:${job.id}`, {
      status: false,
      value: null,
    });
    return done(null, true);
  }
  const wikiDataResponse = await uploadToWikiData(
    job.data.metadata,
    commonsResponse.filename
  );
  if (wikiDataResponse !== 404) {
    const wikisourceResponse = await uploadToWikiSource(
      job.data.metadata,
      wikiDataResponse
    );

    if (wikisourceResponse.fileUploadStatus === 200) {
      process.emit(`commonsJobComplete:${job.id}`, {
        status: true,
        value: {
          commons: commonsResponse,
          wikidata: wikiDataResponse,
          wikisource: wikisourceResponse,
        },
      });
    } else {
      process.emit(`commonsJobComplete:${job.id}`, {
        status: true,
        value: {
          commons: commonsResponse,
          wikidata: wikiDataResponse,
          wikisource: 404,
        },
      });
    }
  } else {
    process.emit(`commonsJobComplete:${job.id}`, {
      status: true,
      value: {
        commons: commonsResponse,
        wikidata: 404,
        wikisource: 404,
      },
    });
  }
  return done(null, true);
});
