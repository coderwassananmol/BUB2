import React from "react";
import Link from "next/link";
import Button from "@material-ui/core/Button";

const QueueSection = ({ active, waiting }) => (
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
    <span className="cdx-card cdx-card-custom">
      <span className="cdx-card__text">
        <span className="cdx-card__text__title">Current active</span>
        <span className="cdx-card__text__description">
          {active || "No active job"}
        </span>
      </span>
    </span>
    <span className="cdx-card cdx-card-custom">
      <span className="cdx-card__text">
        <span className="cdx-card__text__title">Next job</span>
        <span className="cdx-card__text__description">
          {waiting || "No waiting job"}
        </span>
      </span>
    </span>
  </div>
);

export default QueueSection;
