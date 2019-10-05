const Queue = require('bull');
const EmailProducer = require('../email-queue/producer')
const PDLQueue = new Queue('pdl-queue');
const rp = require("request-promise");
const cheerio = require("cheerio"); // Basically jQuery for node.js
const PDFDocument = require("pdfkit");
const fs = require("fs");
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

async function getImages(no_of_pages, id, title) {
    var zip = new JSZip();
    var img = zip.folder(`${title}_images`);
    var length = 0;
    title = title.replace(/ /g,"_")
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
                    length += data.byteLength
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

    var stream = zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })

    let {byteLength} = await zip.generateAsync({type: 'nodebuffer'})

    byteLength = Number(byteLength + 128)

    zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
        .pipe(request(
            {
                method: "PUT",
                preambleCRLF: true,
                postambleCRLF: true,
                uri: `http://s3.us.archive.org/${title}/${title}.zip`,
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
                    "X-archive-meta-title": "Kissa Laila Majnu",
                    "X-archive-meta-language": "Urdu",
                    "X-archive-meta-mediatype": "image",
                    "X-archive-meta-licenseurl":
                        "https://creativecommons.org/publicdomain/mark/1.0/",
                    "X-archive-meta-publisher": "Punjab Digital Library",
                    "X-archive-meta-rights": "public",
                    "X-archive-meta-identifier": `bub_pn_${id}`,
                    "X-archive-meta-pages": "8",
                    "X-archive-meta-script": "Persian",
                    "X-archive-meta-source": "Punjab Digital Library"
                }
            }, (error, response, body) => {
                //fs.unlink(`output${id}.pdf`, err => console.log(err));
                if (response.statusCode === 200) {
                    console.log("Book Uploaded")
                }
                else {
                    console.log(response);
                }
            }));
}

async function uploadToIA(image, metadata) {
    console.log("Uploading to Internet Archive")
    const IAuri = `http://s3.us.archive.org/${metadata.title}/${metadata.title}.zip`;
    const trueURI = `http://archive.org/details/${metadata.title}`;
    const doc = new PDFDocument;
    for (var i = 0; i < image.length; i++) {
        doc.image(image[i], { width: 500, height: 600, align: "center" });
        i !== image.length - 1 ? doc.addPage() : null;
    }
    doc.end();
    new Promise(async (resolve, reject) => {
        doc.pipe(fs.createWriteStream(`output${metadata.id}.pdf`)).on("finish", () => {
            fs.stat(`output${metadata.id}.pdf`, (err, stat) => {
                if (err) reject({ error: true });
                resolve(stat.size);
            });
        });
    }).then(size => {
        fs.createReadStream(`output${metadata.id}.pdf`).pipe(
            )
    })
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
    console.log(metaData);
    await getImages(metaData.no_of_pages, job.data.bookid, metaData.title)
    //await uploadToIA(images, metaData)
    done(null, true);
});