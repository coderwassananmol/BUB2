import React from "react";
import Link from "next/link";

const ShowQueue = ({ data, library }) => (
  <div className="queue-section">
    <style jsx>
      {`
        .cdx-card-custom {
          margin-top: 20px;
          flex: 20%;
          margin-right: 20px;
          max-width: 400px;
        }
        .queue-section {
          display: flex;
          flex-direction: row;
        }
      `}
    </style>
    <a className="cdx-card cdx-card-custom cdx-card--is-link" href="#">
      <span className="cdx-card__text">
        <span className="cdx-card__text__title">{library}</span>
        <span className="cdx-card__text__description">
          Waiting: {data?.waiting}
        </span>
        <span className="cdx-card__text__description">
          Active: {data?.active}
        </span>
        <span className="cdx-card__text__description">
          Completed: {data?.completed}
        </span>
        <span className="cdx-card__text__description">
          Failed: {data?.failed}
        </span>
        <span className="cdx-card__text__description">
          Delayed: {data?.delayed}
        </span>
      </span>
    </a>
  </div>
);

export default ShowQueue;
