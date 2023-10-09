import React, { Component } from "react";
import Link from "next/link";

const UploadedItems = ({ booksUploaded }) => {
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
            {booksUploaded || 0} books uploaded to Internet Archive using BUB2!
          </a>
        </Link>
      </div>
    </div>
  );
};

export default UploadedItems;
