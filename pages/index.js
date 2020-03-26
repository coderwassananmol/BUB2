import Header from "../components/Header";
import Footer from "../components/Footer";
import Books from "../components/Books";
<<<<<<< HEAD
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
=======
const init = () => (
  <div style={{ display: "flex", flexDirection: "column", minHeight: '100vh' }}>
    <Header page="index" />
    <div className="container">
      <div className="row">
        <Books />
        <div className="col-md-6"></div>
      </div>
    </div>
    <div style={{marginTop: 'auto'}}>
      <Footer />
    </div>
>>>>>>> 77ca2dd6e0abc17074f2949d10f660384f3c19f3
  </div>
);

export default init;
