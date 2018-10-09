import React from 'react';
export default class Books extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            option: 'gb',
            bookid: ''
        }
        this.onSubmit = this.onSubmit.bind(this);
    }

    handleChange = (event) => {
        this.setState({ option: event.target.value })
    }

    showExample = () => {
        switch (this.state.option) {
            case 'gb':
                return 'http://books.google.com';
                break;

            case 'wb':
                return 'http://westbengal.com';
                break;

            default:
                return '';
                break;
        }
    }

    onSubmit(event) {
        event.preventDefault();
        fetch('http://172.30.16.38:3000/upload',{
            body : JSON.stringify({
                "bookid":this.state.bookid,
                "option":this.state.option,
                "email":this.state.email
            }),
            headers : {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin":"*"
            },
            method:"POST"
        })
        .then(response => response.json())
        .then(response => {
            if(response.error) {
                alert(response.message);
            }
        })
    }

    render() {
        return (
            <form onSubmit={this.onSubmit}>
                <h3>1. Choose the library:<span> *</span></h3>
                <select value={this.state.option} id="option" name="option" required onChange={this.handleChange}>
                    <option value="gb" selected>Google Books</option>
                    <option value="wb">West Bengal State Library</option>
                </select>
                <h3 >2. Enter the ID ({this.showExample()}) <span> *</span></h3>
                <div class="input-group">
                    <span class="input-group-addon" id="bid">https://books.google.co.in/books?id=</span>
                    <input id="bookid" name="bookid" type="text" placeholder="At46AQAAMAAJ" onChange={(event) => this.setState({ bookid: event.target.value })} required class="form-control" id="bookid" aria-describedby="bid" />
                </div>
                <h3>3. Enter E-Mail</h3>
                <div class="input-group">
                    <input type="email" name="email" class="form-control" id="email" onChange={(event) => this.setState({ email: event.target.value })}/>
                    <div class="input-group-btn">
                        <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><span class="glyphicon glyphicon-question-sign"></span></button>
                        <div class="dropdown-menu well well-sm">
                            <p>It will be used to notify that your upload has been completed.</p>
                        </div>
                    </div>
                </div>
                <button class="btn btn-primary" type="submit">Submit</button>
            </form>
        );
    }
}