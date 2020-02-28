import Header from '../components/Header';
import Footer from '../components/Footer';
import ShowQueue from '../components/ShowQueue';
import Paginate from '../components/Paginate';
import Link from 'next/link';
import fetch from 'isomorphic-fetch';

const emptyObject = {
    waiting: 0,
    active: 0,
    failed: 0,
    completed: 0,
    delayed: 0
}

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
                    <ShowQueue data={!props.data ? emptyObject : props.data.pdl_queue}/>
                </div>
                <div className="particular-card">
                    <div className="card-title">
                        <p>Google Books</p>
                    </div>
                    <ShowQueue data={!props.data ? emptyObject : props.data.pdl_queue}/>
                </div>
            </div>
        <Footer />
    </div>
)

Queue.getInitialProps = async ({query},res) => {
    const host = process.env.NODE_ENV === 'production' ? 'https://bub2.toolforge.org' : 'http://localhost:5000' //If you have port set in env file, replace 5000 with "process.env.PORT"
    const resp = await fetch(`${host}/queuedata`);
    if(resp.status !== 200) {
        return {}
    }
    const data = await resp.json()
    return {data}
}

export default Queue;