import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ShowList from "../../components/ShowList";
import { withRouter } from "next/router";
import { queuelist_data_endpoint } from "../../utils/constants";

const list = ({ data }) => {
  const columns = React.useMemo(() => [
    {
      Header: "Job Id",
      accessor: "JobId"
    },
    {
      Header: "Title",
      accessor: "Title"
    }
  ]);

  const [state, setState] = useState({
    pdlQueue: {
      waiting: [],
      active: [],
      delayed: [],
      completed: [],
      failed: [],
      currentState: "waiting"
    },
    gbQueue: {
      waiting: [],
      active: [],
      delayed: [],
      completed: [],
      failed: [],
      currentState: "waiting"
    }
  });
  const fetchData = (type, pdl_queue = false, gb_queue = false) => {
    const url = `${queuelist_data_endpoint}?type=${type}&pdlqueue=${pdl_queue}&gbqueue=${gb_queue}`;
    fetch(url)
      .then(response => {
        return response.json();
      })
      .then(responseJson => {
        setState({
          pdlQueue: {
            ...state.pdlQueue,
            [type]: pdl_queue ? responseJson.pdl_queue : state.pdlQueue[type],
            currentState: pdl_queue ? type : state.pdlQueue.currentState
          },
          gbQueue: {
            ...state.gbQueue,
            [type]: gb_queue ? responseJson.google_books_queue : state.gbQueue[type],
            currentState: gb_queue ? type : state.gbQueue.currentState
          }
        });
      })
      .catch(error => {
        console.error(error);
      });
  };
  useEffect(() => {
    fetchData("waiting", true, true);
  }, []);

  const handleChange = (type, i) => {
    let pdlQueue = i == 0 ? true : false;
    fetchData(type, pdlQueue, !pdlQueue);
  };
  const types = ["waiting", "active", "delayed", "completed", "failed"];
  return (
    <div>
      <Header page="status" />
      <div className="container">
        <style jsx>
          {`
            .row {
              margin: 4rem auto;
            }
            .panel-heading {
              padding: 0 !important;
              border: 1px solid #000000;
              border-bottom: none;
            }
            .btn {
              padding: 1.2rem;
              outline: none;
              font-size: 16px;
              font-weight: 500;
            }
            .queuename {
              font-size: 2rem;
              font-weight: 600;
              margin-bottom: .5rem;
            }
          `}
        </style>
        {["pdlQueue", "gbQueue"].map((currentItem, i) => (
          <div key={i} className="row">
            <div className="queuename">
              {i == 0 ? "Punjab Digital Library" : "Google Books"}
            </div>
            <div className="panel panel-default">
              <div className="btn-group btn-group-justified panel-heading">
                {types.map((type, index) => {
                  return (
                    <div key={index + 1} className="btn-group">
                      <button
                        type="button"
                        onClick={() => handleChange(type, i)}
                        className={
                          "text-capitalize btn " +
                          (type == state[currentItem].currentState
                            ? "btn-primary"
                            : "btn-default")
                        }
                      >
                        {type} ({state[currentItem][type].length})
                      </button>
                    </div>
                  );
                })}
              </div>
              <ShowList
                columns={columns}
                data={state[currentItem][state[currentItem].currentState]}
                queue={currentItem}
              />
            </div>
          </div>
        ))}
      </div>
      <Footer />
    </div>
  );
};

export default withRouter(list);
