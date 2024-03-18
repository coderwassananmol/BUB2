import { useRouter } from "next/router";
import Header from "../components/Header";
import QueueSection from "../components/QueueSection";
import QueueTable from "../components/QueueTable";
import { host, queue_data_endpoint } from "../utils/constants";
import { useEffect, useState } from "react";

const Queue = ({ data }) => {
  const router = useRouter();
  const [queueName, setQueueName] = useState("gb");
  const [tableDataArchive, setTableDataArchive] = useState([]);
  const [searchResult, setSearchResult] = useState([]);
  const [isSearch, setIsSearch] = useState(false);
  // initially, the page itself is refreshed every 15 seconds (according to GB queue)
  const [refreshSSPropsInterval, setSSPropsInterval] = useState(15000);
  const onChange = (event) => {
    setQueueName(event.target.value);
    // refresh server side props on queue change
    router.replace(router.asPath);
    // This time interval has been chosed based on speed of upload
    // For GB Queue, refresh server side props every 15 seconds
    // For PDL, refresh server side props every 50 seconds
    // For Trove, refresh server side props every 30 seconds
    if (event.target.value === "gb") {
      setSSPropsInterval(15000);
    } else if (event.target.value === "pdl") {
      setSSPropsInterval(50000);
    } else if (event.target.value === "trove") {
      setSSPropsInterval(30000);
    }
  };

  /**
   * The `onSearch` function filters the table data based on a search parameter(Book-title, username or status) and updates the
   * searchResult state which then gets passed to the QueueTable Component. If the search parameter is empty, all the table data is set to the searchResult state and returned to the QueueTable Component without filtering.
   * The unfiltered tableData is stored in the tableDataArchive state and is used to reset the search if the search parameter is empty.
   */
  const onSearch = (e) => {
    const searchParam = e.target.value.toLowerCase();

    if (searchParam === "") {
      setIsSearch(false);
      setSearchResult(tableDataArchive);
      return;
    }

    setIsSearch(true);
    const filteredData = tableDataArchive.filter((item) => {
      return (
        item.title.toLowerCase().includes(searchParam) ||
        item.userName.toLowerCase().includes(searchParam) ||
        item.status.toLowerCase().includes(searchParam) ||
        item.id.toString().includes(searchParam)
      );
    });
    setSearchResult(filteredData);
  };

  const fetchQueueData = () => {
    if (queueName)
      fetch(`${host}/allJobs?queue_name=${queueName}`)
        .then((resp) => resp.json())
        .then((resp) => {
          setTableDataArchive(resp);
          setSearchResult(resp);
        });
  };

  // This useEffect runs on page load and
  // is responsible for fetching the initial
  // queue data
  useEffect(() => {
    if (queueName) {
      fetchQueueData();
    }
  }, [queueName]);

  // This useEffect runs every `refreshSSPropsInterval` milliseconds
  // to refresh the server side props which contain
  // details about books in the active and waiting queue
  // Condition: only when queueName changes
  useEffect(() => {
    const intervalId = setInterval(() => {
      router.replace(router.asPath);
    }, refreshSSPropsInterval);
    // clear the setInterval
    return () => clearInterval(intervalId);
  }, [queueName]);

  // This useEffect runs every 5000 milliseconds
  // to refresh the queue itself, thereby providing
  // user with near real time upload progress
  // Condition: only when queue is active
  useEffect(() => {
    if (
      data[`${queueName}-queue`]["active"] === null &&
      data["commons-queue"]["active"] === null
    ) {
      return;
    }
    const intervalId = setInterval(() => {
      if (data[`${queueName}-queue`]["active"] !== null) {
        fetchQueueData();
      }
    }, 5000);
    // clear the setInterval
    return () => clearInterval(intervalId);
  }, [data[`${queueName}-queue`]["active"]]);

  return (
    <div
      style={{
        minHeight: "114vh",
      }}
    >
      <Header page="queue" />
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
          <QueueSection
            active={data[`${queueName}-queue`]["active"]}
            waiting={data[`${queueName}-queue`]["waiting"]}
          />

          <div className="queue-container">
            <div
              className="search-container"
              style={{
                marginTop: "2em",
              }}
            >
              <div className="cdx-search-input cdx-search-input--has-end-button">
                <div
                  className="cdx-text-input cdx-text-input--has-start-icon"
                  style={{ width: "100%" }}
                >
                  <input
                    onChange={(e) => onSearch(e)}
                    className="cdx-text-input__input"
                    type="search"
                    placeholder="Search by Job ID, Title, Username or Status"
                    style={{
                      height: "48px",
                      width: "100%",
                    }}
                  />
                  <span className="cdx-text-input__icon cdx-text-input__start-icon"></span>
                </div>
              </div>
            </div>
          </div>
          <QueueTable
            isSearch={isSearch}
            queue_name={queueName}
            tableData={searchResult}
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
