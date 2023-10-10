module.exports = {
  emailtemplate: (title, success, uri) => {
    const email_success = `<!doctype html>
<html>
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>${title}</title>

        <style type="text/css">
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
                color: #202122;
                font-family: sans-serif;
            }

            main {
                display: flex;
                justify-content: center;
                align-items: center;
                width: 100vw;
                height: 100vh;
                background: #202122;
            }

            .email-content {
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                align-items: center;
                height: auto;
                width: 90%;
                max-width: 500px;
                background: #f8f9fa;
                padding: 2em;
            }

            .header {
                display: flex;
                justify-content: start;
                align-items: center;
                gap: 0.5em;
                margin-bottom: 2em;
            }

            .header h2 {
                letter-spacing: 3px;
                font-size: 1.5rem;
            }

            .logo {
                width: 50px;
            }

            .email-description {
                display: flex;
                flex-direction: column;
                gap: 1em;
            }

            .email-description h3 {
                font-size: 1.2rem;
                line-height: 1.6;
            }

            .email-description p {
                font-size: 1rem;
                line-height: 1.6;
            }

            .email-description a {
                align-self: center;
            }

            .viewButton {
                border: 0;
                padding: 1em;
                font-weight: bold;
                border-radius: 5px;
                cursor: pointer;
                text-decoration: none;
                background: #2A4B8D;
                color: #fff;
                font-size: 1rem;
            }

            .viewButton:hover {
                background: #3366CC;
            }

           /* RESPONSIVE MEDIA QUERIES */
            @media (max-width: 768px) {
                .email-content {
                    width: 90%;
                    max-width: none;
                }

                .header {
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                }

                .header h2 {
                    margin-top: 0.5em;
                }
            }
        </style>
    </head>

    <body>
        <main>
            <article class="email-content">
                <header class="header">
                    <img class="logo"
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Wikimedia-logo_black.svg/768px-Wikimedia-logo_black.svg.png"
                        alt="logo">
                    <h2>WIKIMEDIA BUB2 TOOL</h2>
                </header>
                <section class='email-description'>
                    <h3>Your file "${title}" has been uploaded to Internet Archive successfully!</h3>
                    <p>The file will now be converted by Internet Archive in various formats. Click on the button to
                        view the
                        uploaded
                        file.</p>
                    <p>Keep uploading!</p>
                    <p>BUB v2.0</p>

                    <a title="View file" href="${uri}" target="_self">
                        <button type="button" class="viewButton">
                            View file
                        </button>
                    </a>
                </section>
            </article>
        </main>
    </body>
</html>`;

    const email_failure = `<!doctype html>
<html>

    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>${title}</title>

        <style type="text/css">
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
                color: #202122;
                font-family: sans-serif;
            }

            main {
                display: flex;
                justify-content: center;
                align-items: center;
                width: 100vw;
                height: 100vh;
                background: #202122;
            }

            .email-content {
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                align-items: center;
                height: auto;
                width: 90%;
                max-width: 500px;
                background: #f8f9fa;
                padding: 2em;
            }

            .header {
                display: flex;
                justify-content: start;
                align-items: center;
                gap: 0.5em;
                margin-bottom: 2em;
            }

            .header h2 {
                letter-spacing: 3px;
                font-size: 1.5rem;
            }

            .logo {
                width: 50px;
            }

            .email-description {
                display: flex;
                flex-direction: column;
                gap: 1em;
            }

            .email-description h3 {
                font-size: 1.2rem;
                line-height: 1.6;
            }

            .email-description p {
                font-size: 1rem;
                line-height: 1.6;
            }

            .email-description a {
                align-self: center;
            }

            .viewButton {
                border: 0;
                padding: 1em;
                font-weight: bold;
                border-radius: 5px;
                cursor: pointer;
                text-decoration: none;
                background: #2A4B8D;
                color: #fff;
                font-size: 1rem;
            }

            .viewButton:hover {
                background: #3366CC;
            }

            /* RESPONSIVE MEDIA QUERIES */
            @media (max-width: 768px) {
                .email-content {
                    width: 90%;
                    max-width: none;
                }

                .header {
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                }

                .header h2 {
                    margin-top: 0.5em;
                }
            }
        </style>
    </head>

    <body>
        <main>
            <article class="email-content">
                <header class="header">
                    <img class="logo"
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Wikimedia-logo_black.svg/768px-Wikimedia-logo_black.svg.png"
                        alt="logo">
                    <h2>WIKIMEDIA BUB2 TOOL</h2>
                </header>
                <section class='email-description'>
                    <h3>Your file "${title}" was not uploaded to Internet Archive</h3>
                    <p>Please try again later</p>
                    <p>Keep uploading!</p>
                    <p>BUB v2.0</p>
                </section>
            </article>
        </main>
    </body>
</html>`;

    if (success) {
      return email_success;
    } else {
      return email_failure;
    }
  },
};
