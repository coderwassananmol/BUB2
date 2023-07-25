import Header from "../components/Header";
import QueueSection from "../components/QueueSection";
import { queue_data_endpoint } from "../utils/constants";
import { useEffect, useState, useRef } from "react";

const Queue = ({ data }) => {
  const [queueName, setQueueName] = useState("gb");
  const onChange = (event) => {
    setQueueName(event.target.value);
  };
  return (
    <div>
      <Header page="queue" />
      <div className="container p-0">
        <div className="main-content">
          <h4>Select a Queue</h4>
          <select className="cdx-select" onChange={onChange}>
            <option value="gb" selected>
              Google Books
            </option>
            <option value="pn">Panjab Digital Library</option>
            <option value="trove">Trove Digital Library</option>
          </select>
          <QueueSection
            active={data[`${queueName}-queue`]["active"]}
            waiting={data["gb-queue"]["waiting"]}
          />
        </div>
      </div>
    </div>
  );
};

export async function getServerSideProps() {
  const resp = await fetch(queue_data_endpoint);
  const data = await resp.json();
  return { props: { data } };
  // Pass data to the page via props
}

export default Queue;
