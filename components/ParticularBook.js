import React from "react";
import Link from "next/link";

export default class ParticularBook extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div>
        <div className="col-md-3">
          <img src={this.props.image} />
        </div>
        <div className="col-md-9">
          <style jsx>
            {`
              .bookdetails {
                font-size: 18px;
                font-family: "Raleway", sans-serif;
                font-weight: 400;
                color: #000;
              }
              table {
                border: 2px solid #000;
                padding: 2px;
                text-align: center;
                font-size: 16px;
                font-weight: 300;
                font-family: "Open Sans", sans-serif;
              }
              table td {
                border: 2px solid #000;
              }
              table td.property {
                font-weight: bold;
              }
            `}
          </style>
          <h2 className="heading">Book Details:</h2>
          <table>
            <tbody>
              <tr>
                <td className="property">Book ID</td>
                <td>{this.props.bookid}</td>
              </tr>
              <tr>
                <td className="property">Book Title</td>
                <td>{this.props.title}</td>
              </tr>
              <tr>
                <td className="property">Publisher</td>
                <td>{this.props.publisher}</td>
              </tr>
              <tr>
                <td className="property">Published Date:</td>
                <td>{this.props.publishedDate}</td>
              </tr>
              <tr>
                <td className="property">Preview Link:</td>
                <td>
                  <Link href={this.props.previewLink} prefetch>
                    <a>Preview Link</a>
                  </Link>
                </td>
              </tr>
              <tr>
                <td className="property">Download Link:</td>
                <td>
                  <Link href={this.props.downloadLink} prefetch>
                    <a>Download Link</a>
                  </Link>
                </td>
              </tr>
              <tr>
                <td className="property">Internet Archive URI</td>
                <td>
                  <Link href={this.props.uri} prefetch>
                    <a>IA Link</a>
                  </Link>
                </td>
              </tr>
              <tr>
                <td className="property">Status</td>
                <td>{this.props.statusText}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}
