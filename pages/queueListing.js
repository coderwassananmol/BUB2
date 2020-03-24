import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ShowList from "../components/ShowList";
import { withRouter } from "next/router";

const queueListing = props => {
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
    waiting: [],
    active: [],
    delayed: [],
    completed: [],
    failed: [],
    currentState: "waiting"
  });
  const fetchData = () => {
    const url = `http://localhost:5000/queue/list`;
    fetch(url)
      .then(response => {
        return response.json();
      })
      .then(responseJson => {
        setState({
          ...state,
          waiting: responseJson.waiting,
          active: responseJson.active,
          delayed: responseJson.delayed,
          completed: responseJson.completed,
          failed: responseJson.failed
        });
      })
      .catch(error => {
        console.error(error);
      });
  };
  useEffect(() => {
    fetchData();
  }, []);
  console.log(state);
  
  const handleChange = status => {
    setState({
      ...state,
      currentState: status
    });
  };

  const types = ["waiting", "active", "delayed", "completed", "failed"];

  return (
    <div>
      <Header page="status" />
      <div className="container">
        <div className="row">
          <style jsx>
            {`
              .panel {
                margin: 5rem auto;
              }
              .panel-heading {
                padding: 0 !important;
              }
              .btn {
                padding: 1.2rem;
                outline: none;
                font-size: 16px;
                font-weight: 500;
              }
            `}
          </style>
          <div className="panel panel-default">
            <div className="btn-group btn-group-justified panel-heading">
              {types.map((type, index) => {
                return (
                  <div key={index + 1} className="btn-group">
                    <button
                      type="button"
                      onClick={() => handleChange(type)}
                      className={
                        "text-capitalize btn " +
                        (type == state.currentState
                          ? "btn-primary"
                          : "btn-default")
                      }
                    >
                      {type} ({state[type].length})
                    </button>
                  </div>
                );
              })}
            </div>
            <ShowList columns={columns} data={state[state.currentState]} />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default withRouter(queueListing);
