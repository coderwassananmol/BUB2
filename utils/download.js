const request = require('request');
const nodemailer = require('nodemailer');
const scissors = require('scissors');
const fs = require('fs');
const emailtemp = require('./email.js');
const bookController = require('../controller/bookController');

require('dotenv').config();

const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.email,
		pass: process.env.password
	}
});

module.exports = {
	downloadFile: (uri, details, email) => {
		const requestURI = request(uri);
		let status = false;
		const {id,volumeInfo,accessInfo} = details;
		const {
			publisher,publishedDate,imageLinks,previewLink,title,language,accessViewStatus,
			pageCount,infoLink
		} = volumeInfo;
		const {pdf} = accessInfo;
		const IAuri = `http://s3.us.archive.org/bub_gb_${id}/bub_gb_${id}.pdf`;
		bookController.createBook(
			id,publisher,pdf.downloadLink,publishedDate,imageLinks.thumbnail,previewLink,title,IAuri,status
		);
		requestURI.pipe(request({
			method: 'PUT',
			preambleCRLF: true,
			postambleCRLF: true,
			uri: IAuri,
			headers: {
				"Authorization": `LOW ${process.env.access_key}:${process.env.secret_key}`,
				"Content-type": "application/pdf; charset=utf-8",
				"Accept-Charset": "utf-8",
				"X-Amz-Auto-Make-Bucket": "1",
				"X-Archive-Meta-Collection": "opensource",
				"X-archive-meta-title": title,
				"X-archive-meta-date": publishedDate,
				"X-archive-meta-language": language,
				"X-archive-meta-licenseurl": "https://creativecommons.org/publicdomain/mark/1.0/",
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
					status = 'Error';
					return { error: true, message: "Download from Google Books failed!" + response }
				}
				else {
					status = 'Successful';
					bookController.updateBook(id,true);
					return { error: false, message: "Upload Successful!" }
				}
			}))

			if(email != '') {
				const mailOptions = {
					from: 'wassan.anmol@gmail.com', // sender address
					to: email, // list of receivers
					subject: `BUB File Upload - ${status}`, // Subject line
					html: emailtemp.emailtemplate(details.volumeInfo.title,details.id,status)// plain text body
				};
	
				transporter.sendMail(mailOptions, function (err, info) {
					if (err)
						console.log(err)
					else
						console.log(info);
				});
			}
	},

}