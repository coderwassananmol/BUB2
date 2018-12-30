import React from 'react';

export default class ParticularBook extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div>
                <div className="col-md-4">
                    <img src="https://vignette.wikia.nocookie.net/2007scape/images/7/7a/Mage%27s_book_detail.png/revision/latest?cb=20180310083825" />
                </div>
                <div className="col-md-6">
                    <ul>
                        <li><strong>Book Name: </strong>My book</li>
                        <li><strong>Author: </strong>Anmol Wassan</li>
                        <li><strong>ISBN: </strong>{this.props.id}</li>
                        <li><strong>Date: </strong>26/01/1998</li>
                    </ul>
                </div>
            </div>
        )
    }
}