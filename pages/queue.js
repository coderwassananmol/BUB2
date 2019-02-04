/**
 * I don't know but a script has to be written that runs in background and keeps on adding books
 * to IA. This needs to be done and then it's done. Only WB will be left then.
 * Let's finish this goddamn thing tonight itself.
 */

import Header from '../components/Header';
import Footer from '../components/Footer';
import ShowQueue from '../components/ShowQueue';
import Link from 'next/link';

const Queue = (props) => (
    <div>
        <Header page="queue"/>
            <ShowQueue data={props.data}/>
        <Footer />
    </div>
)

Queue.getInitialProps = async () => {
    const data = await fetch('http://localhost:3000/api/queue');
    const json = await data.json();
    return {data: json}
}

export default Queue;