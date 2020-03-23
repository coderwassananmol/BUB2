import Header from "../components/Header";
import Footer from "../components/Footer";
import ShowQueue from "../components/ShowQueue";
import fetch from "isomorphic-fetch";
import UploadedItems from "../components/UploadedItems";
import { stats_data_endpoint } from "../utils/constants";

const emptyObject = {
  waiting: 0,
  active: 0,
  failed: 0,
  completed: 0,
  delayed: 0
};

const Stats = props => (
  <div>
    <Header page="stats" />
    <style jsx>
      {`
        .card-container {
          width: 100%;
          display: flex;
          text-align: center;
          justify-content: space-around;
        }
        .particular-card {
          display: block;
          width: 30%;
        }
        .card-title {
          font-size: 24px;
          color: #000;
          font-family: "Lato", sans-serif;
        }
        @media only screen and (min-width: 320px) and (max-width: 480px) {
          .card-container {
            flex-direction: column;
          }
          .particular-card {
            width: 98%;
          }
        }
      `}
    </style>
    <div className="card-container">
      <div className="particular-card">
        <div className="card-title">
          <p>Panjab Digital Library</p>
        </div>
        <ShowQueue data={!props.data ? emptyObject : props.data.pdl_queue} />
      </div>
      <div className="particular-card">
        <div className="card-title">
          <p>Google Books</p>
        </div>
        <ShowQueue data={!props.data ? emptyObject : props.data.google_books_queue} />
      </div>
    </div>
    <UploadedItems />
    <Footer />
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
