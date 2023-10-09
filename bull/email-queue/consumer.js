const emailtemp = require("../../utils/email");
const config = require("../../utils/bullconfig");
const nodemailer = require("nodemailer");
const EmailQueue = config.getNewQueue("email-queue");
const winston = require("winston");
const logger = winston.loggers.get("defaultLogger");

require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: "mail.tools.wmcloud.org",
  port: 587, // set PORT to 465 if secure:true for TLS/SSL
  secure: false,
  auth: {
    user: process.env.TOOL_FORGE_EMAIL,
    pass: process.env.TOOL_FORGE_PASSWORD,
  },
});

EmailQueue.on("active", (job, jobPromise) => {});

EmailQueue.on("completed", (job, result) => {});

EmailQueue.process((job, done) => {
  if (job.data.userName != "") {
    const mailOptions = {
      from: process.env.TOOL_FORGE_EMAIL, // sender address
      to: `${job.data.userName}@toolforge.org`, // list of receivers
      subject: job.data.success
        ? 'BUB File Upload - "Successful"'
        : 'BUB File Upload - "Error"', // Subject line
      html: emailtemp.emailtemplate(
        job.data.title,
        job.data.success,
        job.data.trueURI
      ), // plain text body
    };

    transporter.sendMail(mailOptions, function (err, info) {
      if (err) {
        logger.log({
          level: "error",
          message: `getJobInformation ${err}`,
        });
        done(null, false);
      } else {
        done(null, true);
      }
    });
  }
});
