const config = require("../../utils/bullconfig");
const EmailQueue = config.getNewQueue("email-queue");
const winston = require("winston");
const logger = winston.loggers.get("defaultLogger");
require("dotenv").config();
const { Mwn } = require("mwn");

/* 
Mediawiki Email API DOCS - https://www.mediawiki.org/wiki/API:Emailuser#JavaScript
MWN TOOLFORGE PACKAGE DOCS -https://github.com/siddharthvp/mwn
*/

async function mediawikiEmail(username, title, trueURI, success) {
  try {
    const bot = await Mwn.init({
      apiUrl: process.env.EMAIL_SOURCE_URL,
      username: process.env.EMAIL_BOT_USERNAME,
      password: process.env.EMAIL_BOT_PASSWORD,
      // Set your user agent (required for WMF wikis, see https://meta.wikimedia.org/wiki/User-Agent_policy):
      userAgent: "BUB2/1.0 (https://bub2.toolforge.org)",
      // Set default parameters to be sent to be included in every API request
      defaultParams: {
        assert: "user", // ensure we're logged in
      },
    });

    const csrf_token = bot.getCsrfToken();

    bot
      .request({
        action: "emailuser",
        target: username,
        subject: "BUB2 upload status",
        text: success
          ? `Your file "${title}" has been uploaded to Internet Archive successfully! Take a look at ${trueURI}`
          : `Your file "${title}" was not uploaded to Internet Archive! Please try again later.
          `,
        token: csrf_token,
        format: "json",
      })
      .then((data) => {
        logger.log({
          level: "info",
          message: `Email Sent Successfully! Result : ${data}`,
        });
        return 200;
      })
      .catch((error) => {
        logger.log({
          level: "error",
          message: `Failed to send email with error:  ${error}`,
        });
        return error;
      });
  } catch (error) {
    logger.log({
      level: "error",
      message: `mediawikiEmail:  ${error}`,
    });
    return error;
  }
}

EmailQueue.process(async (job, done) => {
  if (job.data.isEmailNotification === "true") {
    const emailResponse = mediawikiEmail(
      job.data.userName,
      job.data.title,
      job.data.trueURI,
      job.data.success
    );
    if (emailResponse !== 200) {
      done(new Error(`mediawikiEmail: ${emailResponse}`));
    }
    done(null, true);
  } else {
    done(null, true);
  }
});
