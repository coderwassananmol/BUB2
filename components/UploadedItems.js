import React, { Component } from "react";

var finalURL = `https://archive.org/advancedsearch.php?q=bub.wikimedia+&rows=0&output=json`;

class UploadedItems extends Component {
  constructor(props) {
    super(props);
    this.state = {
      result: 0
    }
    this.fetchData = this.fetchData.bind(this);
  }

  fetchData() {
    fetch(finalURL)
      .then((response) => response.json())
      .then((responseJson) => {
        const resultyt = responseJson.response.numFound;
        this.setState({ result: (resultyt-1) });
      })
      .catch((error) => {
        console.error(error);
      });
  }

  componentDidMount() {
    this.fetchData();
  }

  render() {
    return (
      <div className="container">
        <div 
          style={{ 
            fontFamily: 'verdana,"Helvetica Neue",Helvetica,Arial,sans-serif',
            fontSize: '25px',
            fontWeight: 500
          }}
          className="my-2 text-center text-primary">
          {this.state.result} books uploaded to Internet Archive using BUB2!
        </div>
      </div>
    );
  }
}

export default UploadedItems;

