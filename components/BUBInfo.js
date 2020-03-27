import React from "react";

export default function BUBInfo() {
  return (
    <div className="outer">
      <style jsx>
        {`
          .outer {
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            padding: 7vw;
            min-height: 70vh;
            height: 100%;
          }
          .title {
            font-size: 5rem;
            color: white;
            font-weight: 600;
          }
          .subtitle {
            font-size: 1.8rem;
            color: white;
          }
          @media only screen and (min-width: 320px) and (max-width: 480px) {
            .outer {
              min-height: fit-content;
            }
            .title {
              font-size: 4rem;
            }
            .subtitle {
              font-size: 1.5rem;
            }
          }
        `}
      </style>
      <div className="title">Book Uploader Bot (BUB) v2.0</div>
      <div className="subtitle">
        A bot that helps you transfer books that belong to public domain to Internet Archive from
        libraries like Google Books, West Bengal State Library etc. Using IA Upload Tool, you can
        then transfer these books to Wikimedia Commons.
      </div>
    </div>
  );
}
