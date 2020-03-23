 import Header from '../components/Header';
import Footer from '../components/Footer';
import Books from '../components/Books';
const init = () => (
    <div>
        <Header page="index" />
        <div className="container">
            <div className="row">
                    <Books />
                <div className="col-md-6"></div>
            </div>
        </div>
        <Footer />
    </div>
);

export default init;