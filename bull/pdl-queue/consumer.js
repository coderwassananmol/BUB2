const Queue = require('bull');
const EmailProducer = require('../email-queue/producer')
const PDLQueue = new Queue('pdl-queue');
const rp = require("request-promise");
const cheerio = require("cheerio"); // Basically jQuery for node.js
const request = require("request");
var JSZip = require("jszip");
PDLQueue.on('active', (job, jobPromise) => {
    console.log(`Consumer(next): Job ${job.id} is active!`);
});

PDLQueue.on('completed', (job, result) => {
    console.log(`Consumer(next): Job ${job.id} completed! Result: ${result}`);
});

async function getMetaData(options, bookid) {
    const $ = await rp(options);
    let PNdetails = {};
    const no_of_pages = $(
        "font.dhypers"
    ).text();
    const title = $(
        "tbody > tr:nth-child(3) > td > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(2) > table:nth-child(22) > tbody > tr:nth-child(3) > td > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(2) > div > table > tbody > tr:nth-child(1) > td > a"
    ).text();
    const script = $(
        "tbody > tr:nth-child(3) > td > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(2) > table:nth-child(22) > tbody > tr:nth-child(3) > td > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(2) > div > table > tbody > tr:nth-child(5) > td > table > tbody > tr > td:nth-child(2) > a"
    ).text();
    const language = $(
        "tbody > tr:nth-child(3) > td > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(2) > table:nth-child(22) > tbody > tr:nth-child(3) > td > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(2) > div > table > tbody > tr:nth-child(6) > td > table > tbody > tr > td:nth-child(2) > a"
    ).text();
    PNdetails.no_of_pages = no_of_pages;
    PNdetails.title = title;
    PNdetails.id = bookid;
    PNdetails.previewLink = options.uri;
    PNdetails.script = script;
    PNdetails.language = language;
    return PNdetails;
}

async function getZipAndBytelength(no_of_pages, id, title) {
    var zip = new JSZip();
    title = title.replace(/ /g, "_")
    var img = zip.folder(`${title}_images`);
    var download_image = async function (uri, filename) {
        await rp({
            method: "GET",
            uri,
            encoding: null,
            transform: function (body, response) {
                return { headers: response.headers, data: body };
            }
        })
            .then(async function (body) {
                if (/image/.test(body.headers["content-type"])) {
                    var data = new Buffer(body.data)
                    img.file(filename, data.toString("base64"), { base64: true });
                }
            })
            .catch(function (err) {
                console.log(err)
            })
    }
    for (let i = 1; i <= no_of_pages; ++i) {
        const str = `http://www.panjabdigilib.org/images?ID=${id}&page=${i}&pagetype=null&Searched=W3GX`;
        await download_image(str, `${title}_${i}.jpeg`)
    }
    let { byteLength } = await zip.generateAsync({ type: 'nodebuffer' })
    byteLength = Number(byteLength + 128) //Difference of 128 bytes on disk
    return [zip,byteLength]
}

async function uploadToIA(zip, metadata, byteLength, email) {
    let title = metadata.title.replace(/ /g, "_")
    const IAuri = `http://s3.us.archive.org/${title}/${title}.zip`;
    const trueURI = `http://archive.org/details/${title}`;
    zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
        .pipe(request(
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
                    "Content-length": byteLength,
                    "Accept-Charset": "utf-8",
                    "X-Amz-Auto-Make-Bucket": "1",
                    "X-Archive-Meta-Collection": "opensource",
                    "X-Archive-Ignore-Preexisting-Bucket": 1,
                    "X-archive-meta-title": metadata.title,
                    "X-archive-meta-language": metadata.language,
                    "X-archive-meta-mediatype": "image",
                    "X-archive-meta-licenseurl":
                        "https://creativecommons.org/publicdomain/mark/1.0/",
                    "X-archive-meta-publisher": "Punjab Digital Library",
                    "X-archive-meta-rights": "public",
                    "X-archive-meta-identifier": `bub_pn_${metadata.id}`,
                    "X-archive-meta-pages": metadata.no_of_pages,
                    "X-archive-meta-script": metadata.script,
                    "X-archive-meta-source": "Punjab Digital Library"
                }
            }, (error, response, body) => {
                if (response.statusCode === 200) {
                    EmailProducer(email,metadata.title,trueURI,true)
                }
                else {
                    console.log(response);
                    EmailProducer(email,metadata.title,trueURI,false)
                }
            }));
}

PDLQueue.process(async (job, done) => {
    const uri = `http://www.panjabdigilib.org/webuser/searches/displayPage.jsp?ID=${job.data.bookid}&page=1&CategoryID=${job.data.categoryID}&Searched=W3GX`;
    var options = {
        uri,
        transform: function (body) {
            return cheerio.load(body);
        }
    };
    const metaData = await getMetaData(options, job.data.bookid);
    const [zip,byteLength] = await getZipAndBytelength(metaData.no_of_pages, job.data.bookid, metaData.title)
    await uploadToIA(zip, metaData, byteLength, job.data.email)
});