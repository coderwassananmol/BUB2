import Head from "next/head";

// import global styles
import "./../styles/global.css";

function MyApp({ Component, pageProps }) {
  return (
    <div>
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
        {/* stylesheet for the progress bar */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/nprogress@0.2.0/nprogress.css"
        />
        <link
          href="https://fonts.googleapis.com/css?family=Montserrat:300|Open+Sans:300|Raleway:300|Lato:700"
          rel="stylesheet"
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
      <Component {...pageProps} />
    </div>
  );
}

export default MyApp;
