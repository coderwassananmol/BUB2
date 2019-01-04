/**
 * I don't know but a script has to be written that runs in background and keeps on adding books
 * to IA. This needs to be done and then it's done. Only WB will be left then.
 * Let's finish this goddamn thing tonight itself.
 */

import Header from '../components/Header';
import Footer from '../components/Footer';
import ShowQueue from '../components/ShowQueue';

const Queue = (props) => (
    <div>
        <Header page="queue"/>
            <ShowQueue data={props.data}/>
        <Footer />
    </div>
)

Queue.getInitialProps = async function() {
    const res = await fetch('http://localhost:3000/queuedata');
    const json = await res.json();
    return { data: json }
  }

export default Queue;