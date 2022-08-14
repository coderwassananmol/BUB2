import Header from "../components/Header";
import Footer from "../components/Footer";
import Books from "../components/Books";
import BUBInfo from "../components/BUBInfo";
const init = () => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      minHeight: "100vh",
      backgroundColor: "#3ec6ff",
    }}
  >
    <Header page="index" />
    <div className="container p-0">
      <style jsx>
        {`
          display: flex;
          margin: 0;
          flex: 1;
          flex-direction: row;
          width: 100%;
          min-height: 70vh;
          padding: 0 !important;
          @media only screen and (min-width: 320px) and (max-width: 480px) {
            display: unset;
          }
        `}
      </style>
      <div className="row">
        <div className="col-md-6">
          <Books />
        </div>
        <div className="col-md-6">
          <BUBInfo />
        </div>
      </div>
    </div>
    <div style={{ marginTop: "auto" }}>
      <Footer />
    </div>
  </div>
);

export default init;
