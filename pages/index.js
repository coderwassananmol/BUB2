import Header from "../components/Header";
import Books from "../components/Books";
const init = () => (
  <div style={{ overflowX: "hidden" }}>
    <Header page="index" />
    <div className="p-0">
      <div className="col-md-6">
        <Books />
      </div>
    </div>
  </div>
);

export default init;
