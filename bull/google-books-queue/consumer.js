const request = require("request");
const EmailProducer = require("../email-queue/producer");
const config = require("../../utils/bullconfig");
const GoogleBooksQueue = config.getNewQueue("google-books-queue");

let responseSize,
  dataSize = 0;

GoogleBooksQueue.on("active", (job, jobPromise) => {
  console.log(`Consumer(next): Job ${job.id} is active!`);
});

GoogleBooksQueue.on("completed", (job, result) => {
  console.log(`Consumer(next): Job ${job.id} completed! Result: ${result}`);
});

GoogleBooksQueue.process((job, done) => {
  const requestURI = request(job.data.uri);
  const { id, volumeInfo, accessInfo } = job.data.details;
  job.log(JSON.stringify(volumeInfo));
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
  title = title.replace(/ /g, "_");
  const IAuri = `http://s3.us.archive.org/${title}/${title}.pdf`;
  const trueURI = `http://archive.org/details/${title}`;
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
          done(null, false);
          EmailProducer(job.data.email, title, trueURI, false);
        } else {
          done(null, true);
          EmailProducer(job.data.email, title, trueURI, true);
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
