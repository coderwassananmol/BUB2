import React from "react";
import Link from 'next/link';

const ShowQueue = ({ data }) => (
  <div>
    <style jsx>
      {`
      .card {
          background: #337ab7;
          color: #fff;
          font-family: "Open Sans", sans-serif;
          font-size: 18px;
          line-height: 2em;
          margin: 0 10px 0 19px;
          text-align: left;
          box-shadow: 20px 18px 6px 1px #b9b9b9;
      }
      .card > p {
          margin-left: 30px;
      }
  `}
    </style>
    <div className="card">
      <p>Waiting: {data.waiting} jobs</p>
      <p>Active: {data.active} jobs</p>
      <p>Completed: {data.completed} jobs</p>
      <p>Failed: {data.failed} jobs</p>
      <p>Delayed: {data.delayed} jobs</p>
    </div>
  </div>
);

export default ShowQueue;
