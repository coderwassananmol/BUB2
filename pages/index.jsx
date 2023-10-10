import Header from "../components/Header";
import Books from "../components/Books";
const init = () => (
  <div>
    <Header page="index" />
    <div className="container p-0">
      <div className="col-md-6">
        <Books />
      </div>
    </div>
  </div>
);

export default init;
