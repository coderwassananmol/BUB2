import React, { Component, useEffect, useState } from "react";
import Link from "next/link";

const url = `https://archive.org/advancedsearch.php?q=bub.wikimedia+&rows=0&output=json`;

const UploadedItems = (props) => {
  const [booksUploaded, setBooksUploaded] = useState(0);

  useEffect(() => {
    const fetchData = () => {
      fetch(url)
        .then((response) => response.json())
        .then((responseJson) => {
          const booksCount = responseJson.response.numFound;
          setBooksUploaded(booksCount);
        })
        .catch((error) => {
          console.error(error);
        });
    };

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
