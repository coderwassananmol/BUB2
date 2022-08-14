import Header from "../components/Header";
import Footer from "../components/Footer";
import Books from "../components/Books";

const init = () => (
  <div>
    <Header page="index" />
    <div className="container">
      <div className="row">
        <div className="col-md-6">
          <Books error="true" />
        </div>
      </div>
    </div>
    <Footer />
  </div>
);

export default init;
