import React from "react";
import Link from 'next/link';

const ShowQueue = ({ data }) => (
  <div>
    <style jsx>
      {`
        .card {
          background: #ededed;
          padding: 32px 24px;
          border-radius: 1.5rem;
          color: #000000;
          font-family: "Open Sans", sans-serif;
          margin: 0 10px 0 19px;
          text-align: left;
          box-shadow: 2px 2px 2px 1px #00000029;
        }
        .card > p {
          margin: 15px;
          padding: 24px;
          background: #6deb58;
          border-radius: 1rem;
          font-style: normal;
          font-weight: bold;
          font-size: 24px;
          line-height: 28px;
        }
        @media only screen and (min-width: 536px) and (max-width: 767.98px) {
          .card {
            padding: 24px 18px;
            border-radius: 1rem;
          }
          .card-title {
            padding: 20px;
            font-size: 22px;
            line-height: 26px;
          }
        }
        @media only screen and (min-width: 768px) and (max-width: 991.98px) {
          .card {
            padding: 22px 16px;
            border-radius: 1rem;
          }
          .card-title {
            padding: 18px 16px;
            font-size: 22px;
            line-height: 26px;
          }
        }
      `}
    </style>
    <div className="card">
      <p>Waiting - {data.waiting} jobs</p>
      <p>Active - {data.active} jobs</p>
      <p>Completed - {data.completed} jobs</p>
      <p>Failed - {data.failed} jobs</p>
      <p>Delayed - {data.delayed} jobs</p>
    </div>
  </div>
);

export default ShowQueue;
