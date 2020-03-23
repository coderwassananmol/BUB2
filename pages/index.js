import Header from "../components/Header";
import Footer from "../components/Footer";
import Books from "../components/Books";
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
  </div>
);

export default init;
