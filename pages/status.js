import Header from '../components/Header';
import Footer from '../components/Footer';
import ParticularBook from '../components/ParticularBook'
import { withRouter } from 'next/router';
const status = ({data}=props) => (
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
                    status={data.status}
                />
            </div>
        </div>
        <Footer />
    </div>
);

status.getInitialProps = ({query}) => {
    return {data: query}
}

export default withRouter(status);