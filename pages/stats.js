import Header from "../components/Header";
import ShowQueue from "../components/ShowQueue";
import fetch from "isomorphic-fetch";
import UploadedItems from "../components/UploadedItems";
import { stats_data_endpoint } from "../utils/constants";

const emptyObject = {
  waiting: 0,
  active: 0,
  failed: 0,
  completed: 0,
  delayed: 0,
};

const Stats = (props) => (
  <div>
    <Header page="stats" />
    <style jsx>
      {`
        .stats-page {
          background-color: #1da6e0;
          margin: 0;
          padding: 40px;
        }
        .card-container {
          width: 100%;
          display: flex;
          text-align: center;
          justify-content: space-around;
          align-items: flex-end;
          margin-bottom: 4vh;
        }
        .particular-card {
          display: block;
          width: 35%;
        }
        .card-title {
          color: #ffffff;
          font-family: Montserrat;
          font-style: normal;
          font-weight: bold;
          font-size: 32px;
          line-height: 40px;
        }
        @media only screen and (max-width: 575.98px) {
          .card-container {
            flex-direction: column;
            margin-bottom: 2vh;
          }
          .particular-card {
            width: 98%;
            margin-bottom: 30px;
          }
          .stats-page {
            padding: 24px 16px;
          }
          .card-title {
            font-size: 26px;
            line-height: 32px;
          }
        }
        @media only screen and (min-width: 576px) and (max-width: 767.98px) {
          .card-container {
            flex-direction: column;
          }
          .particular-card {
            width: 95%;
            margin-bottom: 30px;
          }
          .stats-page {
            padding: 35px 25px;
          }
          .card-title {
            font-size: 26px;
          }
        }
        @media only screen and (min-width: 768px) and (max-width: 1200px) {
          .particular-card {
            width: 45%;
          }
          .stats-page {
            padding: 35px 25px;
          }
          .card-title {
            font-size: 26px;
          }
        }
      `}
    </style>
    <div className="stats-page">
      <div className="card-container">
        <div className="particular-card">
          <div className="card-title">
            <p>Google Books Queue</p>
          </div>
          <ShowQueue
            data={!props.data ? emptyObject : props.data.google_books_queue}
          />
        </div>
        <div className="particular-card">
          <div className="card-title">
            <p>Panjab Digital Library Queue</p>
          </div>
          <ShowQueue data={!props.data ? emptyObject : props.data.pdl_queue} />
        </div>
        <div className="particular-card">
          <div className="card-title">
            <p>Trove Digital Library Queue</p>
          </div>
          <ShowQueue
            data={!props.data ? emptyObject : props.data.trove_queue}
          />
        </div>
      </div>
      <UploadedItems />
    </div>
  </div>
);

Stats.getInitialProps = async ({ query }, res) => {
  const resp = await fetch(stats_data_endpoint);
  if (resp.status !== 200) {
    return {};
  }
  const data = await resp.json();
  return { data };
};

export default Stats;
