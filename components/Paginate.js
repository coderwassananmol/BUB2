import Link from 'next/link';
import React from 'react';
export default class Paginate extends React.Component {

    render() {
        return (
            <div className="center">
        <style jsx>
            {
                `.center {
                    text-align: center;
                }`
            }
        </style>
        <Link href={{ pathname: `/queue/${this.props.prev}` }}><a>← Prev</a></Link>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <Link href={{ pathname: `/queue/${this.props.next}` }}><a>Next →</a></Link>
    </div>
        )
    }
}