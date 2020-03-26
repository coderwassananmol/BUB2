import Header from "../components/Header";
import Footer from "../components/Footer";
import Books from "../components/Books";
import BUBInfo from "../components/BUBInfo";
const init = () => (
  <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
    <Header page="index" />
    <div
      className="container"
      style={{ margin: 0, width: "100%", minHeight: "70vh", background: "#3EC6FF" }}
    >
      <div className="row " style={{ alignItems: "center" }}>
        <div className="col-md-6" style={{ height: "100%" }}>
          <Books />
        </div>
        <div className="col-md-6 my-auto">
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
