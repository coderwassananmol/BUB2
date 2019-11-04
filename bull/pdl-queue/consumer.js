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

async function getMetaData(options, bookid, categoryID) {
    const $ = await rp(options);
    let PNdetails = {};
    const keys = $('.ubhypers');
    const values = $('.dhypers');

    function addOtherMetaData(limit, keys, values, PNdetails) {
        let value;
        for (let i = 0; i < values.length; i++) {
            if ($(values[i]).attr('href')) {
                if (!$(values[i]).attr('href').includes("Keywords")) {
                    value = i
                    break;
                }
            }
        }

        if (value <= limit) {
            const add = limit - value;
            for (let i = value; i < values.length; i++) {
                PNdetails[[$(keys[i + add]).text()]] = $(values[i]).text().trim();
            }
        }

        else {
            const sub = value - limit;
            for (let i = value; i < values.length; i++) {
                PNdetails[[$(keys[i - sub]).text()]] = $(values[i]).text().trim();
            }
        }
    }

    if ($(values[0]).text().trim() === 'Click here to add description') {
        if ($(values[1]).text().trim() === 'Click here to suggest keywords') {
            for (let i = 2; i < values.length; i++) {
                PNdetails[[$(keys[i + 1]).text()]] = $(values[i]).text().trim();
            }
        }
        else {
            addOtherMetaData(4,keys,values,PNdetails)
        }
    }

    else if ($(values[0]).text().trim() === 'Click here to suggest keywords') {
        for (let i = 1; i < values.length; i++) {
            PNdetails[[$(keys[i + 2]).text()]] = $(values[i]).text().trim();
        }
        PNdetails.description = $('#Nanakshahi > tbody > tr:nth-child(3) > td > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(2) > table:nth-child(22) > tbody > tr:nth-child(3) > td > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(2) > div > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(1) > td:nth-child(2)').text().trim()
    }

    else {
        addOtherMetaData(5,keys,values,PNdetails)
        PNdetails.description = $('#Nanakshahi > tbody > tr:nth-child(3) > td > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(2) > table:nth-child(22) > tbody > tr:nth-child(3) > td > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(2) > div > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(1) > td:nth-child(2)').text().trim()
        PNdetails.description = PNdetails.description.replace(/\n/g,'')
        PNdetails.description = PNdetails.description.replace(/\[edit]/g,'')
    }                                                      

    PNdetails.title = $('#Nanakshahi > tbody > tr:nth-child(3) > td > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(2) > table:nth-child(22) > tbody > tr:nth-child(3) > td > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(2) > div > table > tbody > tr:nth-child(1) > td > a').text().trim()

    PNdetails.bookID = bookid
    PNdetails.categoryID = categoryID;

    delete PNdetails['']

    return PNdetails;
}

async function getZipAndBytelength(no_of_pages, id, title) {
    var zip = new JSZip();
    title = title.replace(/ /g, "_")
    var img = zip.folder(`${title}_images`);
    let temp_pages = no_of_pages;
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
                --no_of_pages;
            })
    }
    for (let i = 1; i <= temp_pages; ++i) {
        const str = `http://www.panjabdigilib.org/images?ID=${id}&page=${i}&pagetype=null&Searched=W3GX`;
        await download_image(str, `${title}_${i}.jpeg`)
        console.log("Image " + i + " zipped.");
    }
    let { byteLength } = await zip.generateAsync({ type: 'nodebuffer' })
    byteLength = Number(byteLength + no_of_pages * 16) //No. of pages * 16
    return [zip, byteLength]
}

function setHeaders(metadata, byteLength, title) {
    let headers = {};
    headers["Authorization"] = `LOW ${process.env.access_key}:${process.env.secret_key}`
    headers["Content-type"] = "application/zip"
    headers["Content-length"] = byteLength
    headers["X-Amz-Auto-Make-Bucket"] = 1
    headers["X-Archive-meta-collection"] = "opensource"
    headers["X-Archive-Ignore-Preexisting-Bucket"] = 1
    headers["X-archive-meta-identifier"] = title
    headers["X-archive-meta-mediatype"] = "image"
    headers["X-archive-meta-uploader"] = "bub.wikimedia@gmail.com" //To be added
    headers["X-archive-meta-contributor"] = "Panjab Digital Library" //To be added
    headers["X-archive-meta-betterpdf"] = true //To be added
    headers["X-archive-meta-external-identifier"] = `urn:pdl:${metadata['bookID']}:${metadata['categoryID']}` //To be added
    for (var key in metadata) {
        let meta_key = key.trim().replace(/ /g, "-").toLowerCase()
        headers[`X-archive-meta-${meta_key}`] = metadata[key];
    }
    headers['X-archive-meta-title'] = metadata['title'];
    return headers;
}

async function uploadToIA(zip, metadata, byteLength, email) {
    let title = metadata.title.replace(/ /g, "_")
    const IAuri = `http://s3.us.archive.org/${title}/${title}_images.zip`;
    const trueURI = `http://archive.org/details/${title}`;
    let headers = setHeaders(metadata,byteLength,title)
    await zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
        .pipe(request(
            {
                method: "PUT",
                preambleCRLF: true,
                postambleCRLF: true,
                uri: IAuri,
                headers: headers
            }, (error, response, body) => {
                if (response.statusCode === 200) {
                    EmailProducer(email,metadata.title,trueURI,true)
                }
                else {
                    console.log(error,response,body)
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
    const metaData = await getMetaData(options, job.data.bookid, job.data.categoryID);
    const [zip,byteLength] = await getZipAndBytelength(metaData['Pages'], job.data.bookid, metaData.title)
    await uploadToIA(zip, metaData, byteLength, job.data.email)
    done(null, true)
});