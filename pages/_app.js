import Head from "next/head";
// import global styles
import "./../styles/global.less";
import Footer from "../components/Footer";
import { SessionProvider } from "next-auth/react";

function MyApp({ Component, pageProps }) {
  return (
    <div>
      <style jsx global>
        {`
          .main-content {
            width: 100%;
            min-height: 80vh;
            display: flex;
            padding: 2.8vw;
            flex-flow: column;
            flex-grow: 1;
          }
          .section {
            margin-top: 40px;
          }
          .loader {
            margin-top: 15px;
          }
          .cdx-label__description {
            -webkit-font-smoothing: antialiased;
          }
          .card-container {
            background-color: #efefef;
            min-width: 100%;
            min-height: fit-content;
            border-radius: 1.5vh;
            display: flex;
            align-items: center;
            flex-direction: column;
            padding: 3vw;
            word-wrap: break-all;
          }
          .image {
            margin: 0 2vw 2vw 2vw;
          }
          .input-group-container {
            background: transparent;
            border: 0.35vh solid black;
            border-radius: 0.5vh;
            font-size: 1.8rem;
            margin-bottom: 4vh;
            height: fit-content;
            margin-bottom: 4vh;
          }
          .input-block {
            background: transparent;
            border: 0.3vh solid black;
            border-radius: 0.5vh;
            padding: 0.5vh;
            min-width: 16rem;
            font-size: 1.3rem;
            margin-bottom: 4vh;
            height: fit-content;
          }
          .submit-button {
            background: #3ec6ff !important;
            color: black;
            border: none;
            text-transform: uppercase;
            height: fit-content;
            padding: 1.2vh 2vh;
          }
          .dynamic-input {
            padding: 0;
            background: #c4c4c4;
            min-width: 32vw;
          }
          .left-floating-label {
            position: absolute;
            font-size: 1.25rem;
            top: -1.25vh;
            left: 1.7vw;
            background-color: #efefef;
            z-index: 100;
          }
          .right-floating-label {
            position: absolute;
            font-size: 1.25rem;
            top: -1.3vh;
            right: 7vw;
            background-color: #efefef;
            z-index: 100;
          }
          .helper {
            padding: 1vh;
            font-size: 1.3rem;
            sbackground: transparent;
            border: none;
            -webkit-font-smoothing: antialiased;
          }
          select {
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
            display: block;
            width: 100%;
            max-width: 320px;
            height: 50px;
            margin: 5px 0px;
            padding: 0px 24px;
            font-size: 16px;
            line-height: 1.75;
            background-image: none;
            border: 1px solid #cccccc;
            -ms-word-break: normal;
            word-break: normal;
          }
          .selector {
            font: 1.6rem "Consolas", monospace;
            color: black;
            -webkit-transform: rotate(90deg);
            -moz-transform: rotate(90deg);
            -ms-transform: rotate(90deg);
            transform: rotate(90deg);
            right: 10px;
            /*Adjust for position however you want*/

            top: 0.9rem;
            padding: 0 0 2px;

            position: absolute;
            pointer-events: none;
          }
          @media only screen and (min-width: 320px) and (max-width: 480px) {
            .image {
              margin: 2vw 5vw 5vw 5vw;
            }
            .right-floating-label {
              right: unset;
              left: 1.7vw;
            }
            .helper {
              display: none;
            }
            .main-content {
              padding: 5vw;
            }
            .selector {
              font: 4vw "Consolas", monospace;
              top: 3vw;
            }
          }
          @media only screen and (min-width: 1440px) and (max-width: 1445px) {
            .selector {
              top: 1.1rem;
              right: 15px;
            }
          }
          @media only screen and (min-width: 1920px) and (max-width: 1925px) {
            .selector {
              top: 1.3rem;
              right: 15px;
            }
          }
        `}
      </style>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        ></meta>
        {/* include bootstrap stylesheet */}
        <link
          rel="stylesheet"
          href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css"
          integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u"
          crossOrigin="anonymous"
        />
        <title>Book Uploader Bot</title>
        {/* Favicons */}
        <meta
          name="msapplication-TileImage"
          content="assets/mstile-150x150.png"
        />
        <link rel="shortcut icon" href="assets/favicon.ico" />
        <link rel="icon" type="image/png" href="assets/favicon.ico" />
        <link
          rel="icon"
          sizes="196x196"
          href="assets/apple-touch-icon.png"
        ></link>
      </Head>
      <SessionProvider>
        <Component {...pageProps} />
      </SessionProvider>
      <Footer />
    </div>
  );
}

export default MyApp;
