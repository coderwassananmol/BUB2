import Header from "../components/Header";
import ShowQueue from "../components/ShowQueue";
import fetch from "isomorphic-fetch";
import { stats_data_endpoint, library } from "../utils/constants";
import { useState } from "react";
import Link from "next/link";

const emptyObject = {
  waiting: 0,
  active: 0,
  failed: 0,
  completed: 0,
  delayed: 0,
};
const Stats = (props) => {
  const [queueName, setQueueName] = useState("gb");
  const onChange = (event) => {
    setQueueName(event.target.value);
  };
  return (
    <div>
      <style jsx>
        {`
          .cdx-message__content {
            color: #36c;
            flex-grow: 0;
          }
          .cdx-message {
            margin-top: 20px;
            flex-grow: 0.1;
            justify-content: center;
            align-items: center;
          }
        `}
      </style>
      <Header page="stats" />
      <div>
        <div className="container p-0">
          <div className="main-content">
            <h4>Select a Queue</h4>
            <select className="cdx-select" onChange={onChange}>
              <option value="gb" selected>
                Google Books
              </option>
              <option value="pdl">Panjab Digital Library</option>
              <option value="trove">Trove Digital Library</option>
            </select>
            <ShowQueue
              data={
                !props.data.queueStats
                  ? emptyObject
                  : props.data.queueStats[`${queueName}`]
              }
              library={library[queueName]}
            />
            <div
              className="cdx-message cdx-message--block cdx-message--success"
              aria-live="polite"
              style={{ display: "flex", flexDirection: "column" }}
            >
              <div>
                <span className="cdx-message__icon"></span>
                <span className="cdx-message__content">
                  <Link href={"https://archive.org/details/@bub_wikimedia"}>
                    <a target="_blank">
                      {props.data.totalUploadedCount} books uploaded to Internet
                      Archive using BUB2!
                    </a>
                  </Link>
                </span>
              </div>

              <div>
                <span className="cdx-message__icon"></span>
                <span className="cdx-message__content">
                  <Link
                    href={
                      process.env.NEXT_PUBLIC_COMMONS_URL +
                      "/wiki/Category:Files_uploaded_with_BUB2"
                    }
                  >
                    <a target="_blank">
                      {props.data.commonsUploadedCount} books uploaded to
                      Wikimedia Commons using BUB2!
                    </a>
                  </Link>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export async function getServerSideProps() {
  const resp = await fetch(stats_data_endpoint);
  if (resp.status !== 200) {
    return {};
  }
  const data = await resp.json();
  return { props: { data } };
  // Pass data to the page via props
}

export default Stats;
