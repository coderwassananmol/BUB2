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
          <style jsx>
            {`
              .bookimg {
                max-width: 200px;
                max-height: 400px;
              }
            `}
          </style>
          <img src={this.props.image} className="bookimg" />
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
                <td className="property">Book ID:</td>
                {
                  this.props.bookid !== undefined ? 
                  <td>
                    {this.props.bookid}
                  </td>
                  : <td>Not available</td>
                }
              </tr>
              <tr>
                <td className="property">Book Title:</td>
                {
                  this.props.title !== undefined ? 
                  <td>
                    {this.props.title}
                  </td>
                  : <td>Not available</td>
                }
              </tr>
              <tr>
                <td className="property">Publisher:</td>
                {
                  this.props.publisher !== undefined ? 
                  <td>
                    {this.props.publisher}
                  </td>
                  : <td>Not available</td>
                }
              </tr>
              <tr>
                <td className="property">Published Date:</td>
                {
                  this.props.publishedDate !== undefined ? 
                  <td>
                    {this.props.publishedDate}
                  </td>
                  : <td>Not available</td>
                }
              </tr>
              <tr>
                <td className="property">Preview Link:</td>
                <td>
                {
                  this.props.previewLink !== undefined ? 
                  <Link href={this.props.previewLink} prefetch>
                    <a target="_blank">Preview Link</a>
                  </Link> : <td>Not available</td>
                }
                </td>
              </tr>
              <tr>
                <td className="property">Download Link:</td>
                <td>
                {
                  this.props.downloadLink !== undefined ? 
                  <Link href={this.props.downloadLink} prefetch>
                    <a target="_blank">Download Link</a>
                  </Link> : <p>Not available</p>
                }
                </td>
              </tr>
              <tr>
                <td className="property">Internet Archive URI</td>
                <td>
                {
                  this.props.uri !== undefined ? 
                  <Link href={this.props.uri} prefetch>
                    <a target="_blank">IA Link</a>
                  </Link> : <td>Not available</td>
                }
                </td>
              </tr>
              <tr>
                <td className="property">Status</td>
                {
                  this.props.statusText !== undefined ? 
                  <td>
                    {this.props.statusText}
                  </td>
                  : <td>Not available</td>
                }
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}
