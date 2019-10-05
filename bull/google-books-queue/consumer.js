const Queue = require('bull');
const request = require("request");
const EmailProducer = require('../email-queue/producer')
const GoogleBooksQueue = new Queue('google-books-queue');

GoogleBooksQueue.on('active', (job, jobPromise) => {
    console.log(`Consumer(next): Job ${job.id} is active!`);
});

GoogleBooksQueue.on('completed', (job, result) => {
    console.log(`Consumer(next): Job ${job.id} completed! Result: ${result}`);
});

GoogleBooksQueue.process((job,done) => {
    const requestURI = request(job.data.uri);
    const { id, volumeInfo, accessInfo } = job.data.details;
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
                    done(null,false)
                    EmailProducer(job.data.email,title,trueURI,false)
                } else {
                    done(null,true)
                    EmailProducer(job.data.email,title,trueURI,true)
                }
            }
        )
    );
})