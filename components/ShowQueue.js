import React from "react";
import Link from 'next/link';

export default class ShowQueue extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    /**
     * Modifcation:
     * 1. We will be showing the timestamp as well.
     * 2. Include Next > and < Prev in the end for pagination.
     * 3. We need to fetch 40 entries each side. The reason for this is we are including
     * pagination and we need to fade out Next/Prev anchor links.
     */
    return (
      <div className="container">
        <style jsx>
          {`
            .header {
              background-color: #000;
              font-family: "Raleway", sans-serif;
              text-align: center;
            }
            .headerText {
              color: #fff;
              font-size: 16px;
              padding: 10px;
              border: 2px solid #fff;
            }
            .itemRow {
              margin: 0 auto;
            }
            .item {
              color: #000;
              font-size: 16px;
              text-align: center;
              font-family: "Open Sans", sans-serif;
            }
          `}
        </style>
        <div className="row header">
          <div className="col-md-3 headerText">
            <p>ID</p>
          </div>
          <div className="col-md-6 headerText">
            <p>Title</p>
          </div>
          <div className="col-md-3 headerText">
            <p>Status</p>
          </div>
        </div>
        {this.props.data.map((item,index) => {
        return (
            <div key={item._id} className="row itemRow">
            <div className="col-md-3 item">
              <Link href={`/upload/${item.bookid}`}><a>{item.bookid}</a></Link>
            </div>
            <div className="col-md-6 item">
              <p>{item.title}</p>
            </div>
            <div className="col-md-3 item">
              <p>{item.statusText}</p>
            </div>
          </div>
        )
      })
        }
      </div>
    );
  }
}

/**
 * Passed a prop with page = {1}. So it can be passed to the server as a query param.
 * Hope it goes alright.
 * Can be used with Index.getInitialProps and fetch the data.
 */
