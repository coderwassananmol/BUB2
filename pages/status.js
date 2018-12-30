import Header from '../components/Header';
import Footer from '../components/Footer';
import ParticularBook from '../components/ParticularBook'
import { withRouter } from 'next/router';

const status = (props) => (
    <div>
        <Header page="status" />
        <div className="container">
            <div className="row">
                <ParticularBook id={props.router.query.id}/>
            </div>
        </div>
        <Footer />
    </div>
);

export default withRouter(status);