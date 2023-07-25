import Header from "../components/Header";
import ParticularBook from "../components/ParticularBook";
import { withRouter } from "next/router";
const status = ({ data } = props) => (
  <div>
    <Header page="status" />
    <div className="container">
      <div className="row">
        <ParticularBook
          bookid={data.bookid}
          publisher={data.publisher}
          publishedDate={data.publishedDate}
          image={data.imageLinks}
          previewLink={data.previewLink}
          downloadLink={data.downloadLink}
          title={data.title}
          uri={data.uri}
          statusText={data.statusText}
        />
      </div>
    </div>
  </div>
);

status.getInitialProps = ({ query }) => {
  return { data: query };
};

export default withRouter(status);
