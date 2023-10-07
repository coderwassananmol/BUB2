const fetch = require("node-fetch");

/* 
mediawiki Email API DOCS - https://www.mediawiki.org/wiki/API:Emailuser#JavaScript
*/

function mediawikiEmail(username, message) {
  // Step 1: GET request to fetch login token
  async function getLoginToken() {
    const wikipediaUrl = "https://en.wikipedia.org/w/api.php";
    const params_0 = {
      action: "query",
      type: "login",
      format: "json",
      meta: "tokens",
    };
    try {
      const response = await fetch(
        wikipediaUrl + "?" + new URLSearchParams(params_0)
      );
      const data = await response.json();
      loginRequest(data.query.tokens.logintoken);
    } catch (error) {
      console.log("getLoginToken Error:", error);
    }
  }

  /* 
  Step 2: POST request to log in (update with your bot credentials)
  Obtain credentials via Special:BotPasswords - https://www.mediawiki.org/wiki/Special:BotPasswords for lgname & lgpassword
  */
  async function loginRequest(login_token) {
    const params_1 = {
      action: "query",
      format: "json",
      meta: "tokens",
      type: "login",
    };
    const wikipediaUrl =
      "https://en.wikipedia.org/w/api.php" +
      "?" +
      new URLSearchParams(params_1);
    const bodyParams = {
      lgpassword: process.env.EMAIL_BOT_PASSWORD,
      lgtoken: login_token,
    };
    try {
      const response = await fetch(wikipediaUrl, {
        method: "POST",
        body: bodyParams,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      const data = await response.json();
      getCsrfToken(data.query.tokens.logintoken);
    } catch (error) {
      console.log("loginRequest error :", error);
    }
  }

  // Step 3: GET request to fetch CSRF token
  async function getCsrfToken(login_token) {
    const wikipediaUrl = "https://en.wikipedia.org/w/api.php";
    const params_2 = {
      action: "query",
      meta: "tokens",
      format: "json",
    };
    const cookies = `logintoken=${login_token}`;
    const headers = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36",
      Cookie: cookies,
    };
    try {
      const response = await fetch(
        wikipediaUrl + "?" + new URLSearchParams(params_2),
        { headers }
      );
      const data = await response.json();
      sendEmail(data.query.tokens.csrftoken);
    } catch (error) {
      console.log("getCsrfToken error :", error);
    }
  }

  // Step 4: POST request to send an email (update with your email parameters)
  async function sendEmail(csrf_token) {
    const wikipediaUrl = "https://en.wikipedia.org/w/api.php";
    const params_3 = {
      action: "emailuser",
      target: username,
      subject: "BUB2 TOOL UPLOAD UPDATE",
      text: message,
      token: csrf_token,
      format: "json",
    };

    try {
      const response = await fetch(wikipediaUrl, {
        method: "POST",
        body: new URLSearchParams(params_3),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      const data = await response.json();
      console.log("sendEmail  res", data);
    } catch (error) {
      console.log("sendEmail error", error);
    }
  }

  // Start the Wikipedia API requests from Step 1
  getLoginToken();
}

module.exports = mediawikiEmail;
