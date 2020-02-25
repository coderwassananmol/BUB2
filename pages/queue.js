import Header from '../components/Header';
import Footer from '../components/Footer';
import ShowQueue from '../components/ShowQueue';
import Paginate from '../components/Paginate';
import Link from 'next/link';

const Queue = (props) => (
    <div>
        <Header page="queue"/>
            <style jsx>
            {`
                .card-container {
                    width: 100%;
                    display: flex;
                    text-align: center;
                    justify-content: space-around
                }
                .particular-card {
                    display: block;
                    width: 30%;
                }
                .card-title {
                    font-size: 24px;
                    color: #000;
                    font-family: "Lato", sans-serif;
                }
            `}
            </style>
            <div className="card-container">
                <div className="particular-card">
                    <div className="card-title">
                        <p>Panjab Digital Library</p>
                    </div>
                    <ShowQueue data={props.data.pdl_queue}/>
                </div>
                <div className="particular-card">
                    <div className="card-title">
                        <p>Google Books</p>
                    </div>
                    <ShowQueue data={props.data.google_books_queue}/>
                </div>
            </div>
        <Footer />
    </div>
)

Queue.getInitialProps = async ({query},res) => {
    console.log(query,"::query")
    console.log(res,"::res")
    const port = process.env.PORT || 5000;
    const resp = await fetch(`http://localhost:${port}/queuedata`);
    const data = await resp.json()
    return {data}
}

export default Queue;