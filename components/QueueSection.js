import React from "react";
import Link from "next/link";
import Button from "@material-ui/core/Button";

const QueueSection = ({ name, active, waiting, queue_name }) => (
  <div className="container">
    <style jsx>
      {`
        div.container {
          padding: 10px;
        }
        h3 {
          font-family: "Lato", sans-serif;
        }
        p {
          font-family: "Open-Sans", sans-serif;
        }
      `}
    </style>
    <h3>{name}</h3>
    <p>Current Active: {active || "No active job"}</p>
    <p>Next: {waiting || "No active job"}</p>
    <Link href="/queue/list/[queue_name]" as={`/queue/list/${queue_name}`}>
      <Button size="large" variant="contained" color="secondary">
        Show Queue
      </Button>
    </Link>
  </div>
);

export default QueueSection;
