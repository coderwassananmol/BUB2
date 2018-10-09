import Header from '../components/Header';
import Footer from '../components/Footer';
import Books from '../components/Books';
const init = () => (
    <div>
        <Header page="index" />
        <div class="container">
            <div class="row">
                <div class="col-md-6">
                    <Books />
                </div>
            </div>
        </div>
        <Footer />
    </div>
);

export default init;