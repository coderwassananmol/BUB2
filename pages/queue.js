/**
 * I don't know but a script has to be written that runs in background and keeps on adding books
 * to IA. This needs to be done and then it's done. Only WB will be left then.
 * Let's finish this goddamn thing tonight itself.
 */

import Header from '../components/Header';
import Footer from '../components/Footer';
import ShowQueue from '../components/ShowQueue';
import Paginate from '../components/Paginate';
import Link from 'next/link';

const Queue = (props) => (
    <div>
        <Header page="queue"/>
            <Paginate prev={props.prev != 0 ? props.prev : ''} next={props.next}/>
            <ShowQueue data = {props.data} />
        <Footer />
    </div>
)

Queue.getInitialProps = ({query},res) => {
    return {data: query, prev: query.page-1, next: Number(query.page)+1}
}

export default Queue;