import Header from "../components/Header";
import QueueSection from "../components/QueueSection";
import QueueTable from "../components/QueueTable";
import { queue_data_endpoint } from "../utils/constants";
import { useState } from "react";

const Queue = ({ data }) => {
  const [queueName, setQueueName] = useState("gb");
  const onChange = (event) => {
    setQueueName(event.target.value);
  };
  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("searching...");
  };

  return (
    <div>
      <Header page="queue" />
      <div className="container p-0">
        <div className="main-content">
          <div className="queue-container">
            <div>
              <h4>Select a Queue</h4>
              <select className="cdx-select" onChange={onChange}>
                <option value="gb" selected>
                  Google Books
                </option>
                <option value="pdl">Panjab Digital Library</option>
                <option value="trove">Trove Digital Library</option>
              </select>
            </div>
            <div className="search-container">
              <h4>Search a Book</h4>
              <div
                className="cdx-search-input cdx-search-input--has-end-button"
                style={{ width: "max-content" }}
              >
                <div className="cdx-text-input cdx-text-input--has-start-icon">
                  <input
                    className="cdx-text-input__input"
                    type="search"
                    placeholder="Search Book"
                    style={{ height: "48px" }}
                  />
                  <span className="cdx-text-input__icon cdx-text-input__start-icon"></span>
                </div>
                <button
                  className="cdx-button cdx-search-input__end-button"
                  onClick={handleSubmit}
                >
                  Search
                </button>
              </div>
            </div>
          </div>

          <QueueSection
            active={data[`${queueName}-queue`]["active"]}
            waiting={data[`${queueName}-queue`]["waiting"]}
          />
          <QueueTable queue_name={queueName} />
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
