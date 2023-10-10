import React, { Component } from "react";
import Link from "next/link";

const url = `https://archive.org/advancedsearch.php?q=bub.wikimedia+&rows=0&output=json`;

class UploadedItems extends Component {
  constructor(props) {
    super(props);
    this.state = {
      booksUploaded: 0
    }
    this.fetchData = this.fetchData.bind(this);
  }

  fetchData() {
    fetch(url)
      .then((response) => response.json())
      .then((responseJson) => {
        const booksCount = responseJson.response.numFound;
        this.setState({ booksUploaded: booksCount });
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
              font-family: verdana, "Helvetica Neue", Helvetica, Arial, sans-serif;
              font-size: 26px;
              font-weight: 500;
            }
            .books-uploaded > a{
              color: #ffffff;
            }
          `}
        </style>
        <div className="my-2 text-center books-uploaded">
          <Link href={"https://archive.org/details/@bub_wikimedia"}>
            <a target="_blank">{this.state.booksUploaded} books uploaded to Internet Archive using BUB2!</a>
          </Link>
        </div>
      </div>
    );
  }
}

export default UploadedItems;

