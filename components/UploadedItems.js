import React, { Component } from "react";

var items = 50;
var finalURL = `https://archive.org/advancedsearch.php?q=bub.wikimedia+&fl%5B%5D=identifier&fl%5B%5D=publicdate&fl%5B%5D=title&sort%5B%5D=publicdate+desc&sort%5B%5D=&sort%5B%5D=&rows=${items}&page=1&output=json`;

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
      <div className="container my-2">
        <div className="h4">Books Uploaded: <span className="text-primary h4">{this.state.result}</span> </div>
      </div>
    );
  }
}

export default UploadedItems;

