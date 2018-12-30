const request = require('request');
const nodemailer = require('nodemailer');
const scissors = require('scissors');
const fs = require('fs');
const emailtemp = require('./email.js');

require('dotenv').config();

const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: 'wassan.anmol@gmail.com',
		pass: 'coderwikianmol123@'
	}
});

module.exports = {
	downloadFile: (uri, details, email) => {
		const requestURI = request(uri);
		requestURI.pipe(fs.createWriteStream(`bub_gb_${details.id}.pdf`));
		let status;
		console.log(encodeURI(details.volumeInfo.publisher));
		requestURI.pipe(request({
			method: 'PUT',
			preambleCRLF: true,
			postambleCRLF: true,
			uri: `http://s3.us.archive.org/bub_gb_${details.id}/bub_gb_${details.id}.pdf`,
			headers: {
				"Authorization": `LOW ${process.env.access_key}:${process.env.secret_key}`,
				"Content-type": "application/pdf; charset=utf-8",
				"Accept-Charset": "utf-8",
				"X-Amz-Auto-Make-Bucket": "1",
				"X-Archive-Meta-Collection": "opensource",
				"X-archive-meta-title": details.volumeInfo.title,
				"X-archive-meta-date": details.volumeInfo.publishedDate,
				"X-archive-meta-language": details.volumeInfo.language,
				"X-archive-meta-licenseurl": "https://creativecommons.org/publicdomain/mark/1.0/",
				"X-archive-meta-publisher": details.volumeInfo.publisher,
				"X-archive-meta-rights": details.accessInfo.accessViewStatus,
				"X-archive-meta-Google-id": details.id,
				"X-archive-meta-Identifier": `bub_gb_${details.id}`,
				"X-archive-meta-Pages": details.volumeInfo.pageCount,
				"X-archive-meta-Source": details.volumeInfo.infoLink
			}
		},
			(error, response, body) => {
				if (error || response.statusCode != 200) {
					console.error(error);
					console.error(response);
					status = 'Error'
					return { error: true, message: "Download from Google Books failed!" + response }
				}
				else {
					status = 'Successful';
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