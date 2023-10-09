import React, { useState, useEffect } from "react";
import Link from "next/link";
const url = `https://archive.org/advancedsearch.php?q=bub.wikimedia+&rows=0&output=json`;

const UploadedItems = () => {
  const [booksUploaded, setBooksUploaded] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(url);
        const responseJson = await response.json();
        const booksCount = await responseJson.response.numFound;
        console.log("booksCount", booksCount);
        setBooksUploaded(booksCount);
      } catch (error) {
        console.log(error);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="container">
      <style jsx>
        {`
          .books-uploaded {
            font-family: verdana, "Helvetica Neue", Helvetica, Arial, sans-serif;
            font-size: 26px;
            font-weight: 500;
          }
          .books-uploaded > a {
            color: #ffffff;
          }
        `}
      </style>
      <div className="my-2 text-center books-uploaded">
        <Link href={"https://archive.org/details/@bub_wikimedia"}>
          <a target="_blank">
            {booksUploaded} books uploaded to Internet Archive using BUB2!
          </a>
        </Link>
      </div>
    </div>
  );
};
export default UploadedItems;
