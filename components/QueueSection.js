import React from "react";
import Link from 'next/link';

const QueueSection = ({ name,active,waiting }) => (
  <div className="container">
    <style jsx>
      {`
        div.container {
            padding: 10px;
        }
        h3 {
            font-family: 'Lato', sans-serif;
        }
        p {
            font-family: 'Open-Sans', sans-serif;
        }
     `}
    </style>
    <h3>{name}</h3>
    <p>Current Active: {(active && active.title) || "No active job"}</p>
    <p>Next: {(waiting && waiting.title) || "No waiting job"}</p>
    <button className="btn btn-primary">Show Queue</button>
  </div>
);

export default QueueSection;
