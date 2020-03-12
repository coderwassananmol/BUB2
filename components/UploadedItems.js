import React, { Component } from "react";
import Link from "next/link";

const finalURL = `https://archive.org/advancedsearch.php?q=bub.wikimedia+&rows=0&output=json`;

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
        this.setState({ result: resultyt });
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
        <style jsx>
          {`
            .books-uploaded {
              font-family: verdana, "Helvetica Neue", Helvetica, Arial,
                sans-serif;
              font-size: 25px;
              font-weight: 500;
            }
          `}
        </style>
        <div className="my-2 text-center text-primary books-uploaded">
          <Link href={" https://archive.org/details/@bub_wikimedia"}>
            <a target="_blank">{this.state.result} books uploaded to Internet Archive using BUB2!</a>
          </Link>
        </div>
      </div>
    );
  }
}

export default UploadedItems;

