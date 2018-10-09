import Header from '../components/Header';
import Footer from '../components/Footer';
import Books from '../components/Books';

const init = ({url : {query: { error }}}) => (
    <div>
        <Header page="index" />
        <div class="container">
            <div class="row">
                <div class="col-md-6">
                    <Books error="true"/>
                </div>
            </div>
        </div>
        <Footer />
    </div>
);

export default init;