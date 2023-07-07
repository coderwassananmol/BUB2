import React from "react";
import Swal from "sweetalert2";
import bookIcon from "./bookIcon";
import { host } from "../utils/constants";
import { withSession } from "../hooks/withSession";

class Books extends React.Component {
  /**
   * @param {Object} props
   * @constructor
   */
  constructor(props) {
    super(props);
    this.state = {
      option: "gb",
      bookid: "",
      email: "",
      show: true,
      loader: false,
    };
    this.onSubmit = this.onSubmit.bind(this);
  }

  /**
   * Change the `option` state when user selects a different library
   * @param {Object} event
   */
  handleChange = (event) => {
    this.setState({ option: event.target.value });
  };

  /**
   * Change the example when user selects a different library
   * @return {String}
   */
  showExample = () => {
    let url = "";
    switch (this.state.option) {
      case "gb":
        url = "https://books.google.co.in/books?id=At46AQAAMAAJ";
        break;

      case "pn":
        url =
          "http://www.panjabdigilib.org/webuser/searches/displayPage.jsp?ID=365&page=1&CategoryID=5&Searched=";
        break;

      case "trove":
        url =
          "The service will fetch the original issue from the article ID (not just the article)";
        break;
    }
    return url;
  };

  /**
   * Makes a request from Google Books API based on the entered book Id
   * If the book Id is not valid the request resolves with an error message
   */
  validateGoogleBook = (enteredId) => {
    let googleUrl = `https://www.googleapis.com/books/v1/volumes/${enteredId}`;
    fetch(googleUrl)
      .then((response) => response.json())
      .then((details) => {
        if (details.error && details.error.code === 404) {
          alert("The volume ID could not be found.");
        } else if (details.error) {
          alert("Please give a valid volume ID.");
        } else {
          this.setState({
            bookid: details.id,
            bookTitle: details.volumeInfo.title,
            bookAuthors: details.volumeInfo.authors,
            bookDescription: details.volumeInfo.description,
            bookCover: details.volumeInfo.imageLinks.thumbnail,
          });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  renderContent = (option) => {
    switch (option) {
      case "gb":
        return (
          <>
            <div className="right-floating-label">Enter Book ID</div>
            <span className="input-group-addon helper" id="bid">
              https://books.google.co.in/books?id=
            </span>
            <input
              style={{ background: "#EFEFEF", border: "none" }}
              id="bookid"
              name="bookid"
              type="text"
              placeholder="At46AQAAMAAJ"
              onChange={(event) =>
                this.setState({ bookid: event.target.value })
              }
              required
              className="form-control"
              aria-describedby="bid"
            />
          </>
        );

      case "pn":
        return (
          <>
            <div className="right-floating-label">Enter URI</div>
            <input
              style={{ background: "#EFEFEF", border: "none" }}
              id="bookid"
              name="bookid"
              type="url"
              placeholder="http://www.panjabdigilib.org/webuser/searches/displayPage.jsp?ID=365&page=1&CategoryID=5&Searched="
              onChange={(event) =>
                this.setState({ bookid: event.target.value })
              }
              required
              className="form-control"
              aria-describedby="bid"
            />
          </>
        );

      case "trove":
        return (
          <>
            <div className="right-floating-label">
              Enter Newspaper/Gazette Article ID
            </div>
            <span className="input-group-addon helper" id="bid">
              https://trove.nla.gov.au/newspaper/article/
            </span>
            <input
              style={{ background: "#EFEFEF", border: "none" }}
              id="bookid"
              name="bookid"
              type="text"
              placeholder="249146214"
              onChange={(event) =>
                this.setState({ bookid: event.target.value })
              }
              required
              className="form-control"
              aria-describedby="bid"
            />
          </>
        );
    }
  };

  isPDLValidUrl = (urlString) => {
    var urlPattren = new RegExp(
      "((http|https)\\:\\/\\/)(www.)?(panjabdigilib\\.org\\/webuser\\/searches\\/displayPage\\.jsp\\?ID\\=)([0-9]*)(\\&page\\=)([0-9]*)(\\&CategoryID\\=)([0-9]*)(\\&Searched\\=)([a-zA-Z0-9@:%._+~#?&//=]*)"
    );
    return urlPattren.test(urlString);
  };

  onSubmit = (event) => {
    event.preventDefault();
    this.setState({
      loader: true,
    });

    let url = "";
    switch (this.state.option) {
      case "gb":
        url = `${host}/check?bookid=${this.state.bookid}&option=${
          this.state.option +
          (this.state.email ? "&email=" + this.state.email : "")
        }`;
        fetch(url)
          .then((response) => response.json())
          .then(async (response) => {
            this.setState({
              loader: false,
            });
            if (response.error) {
              Swal("Error!", response.message, "error");
            } else {
              const { value: url } = await Swal({
                input: "url",
                backdrop: true,
                width: "50%",
                allowEscapeKey: false,
                allowOutsideClick: false,
                showCloseButton: true,
                title:
                  '<strong style="font-size: 22px;">Just a few more steps...</strong>',
                html:
                  `<ol style="text-align: left; font-size: 16px; line-height: 1.5">` +
                  `<li>Go to this link: <a href = "${response.url}">${response.title}</a></li>` +
                  `<li>Enter the captcha.</li>` +
                  `<li>Enter the URL below (<i>https://books.googleusercontent.com/books/content?req=xxx</i>)</li>`,
              });

              if (url && typeof url !== "object") {
                this.setState({
                  loader: true,
                });
                fetch(`${host}/download`, {
                  body: JSON.stringify({
                    url: url,
                  }),
                  headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                  },
                  method: "POST",
                })
                  .then((response) => response.json())
                  .then((response) => {
                    this.setState({
                      loader: false,
                    });
                    if (response.error)
                      Swal("Error!", response.message, "error");
                    else Swal("Voila!", response.message, "success");
                  });
              }
            }
          });
        break;

      // case "obp":
      //   const IDobp = this.state.bookid;
      //   const categoryObp = "";
      //   url = `/check?bookid=${IDobp}&option=${
      //     this.state.option +
      //     (this.state.email ? "&email=" + this.state.email : "")
      //   }&categoryID=${categoryObp}`;
      //   fetch(url)
      //     .then((res) => res.json())
      //     .then((response) => {
      //       this.setState({
      //         loader: false,
      //       });
      //       if (response.error) Swal("Error!", response.message, "error");
      //       else Swal("Voila!", response.message, "success");
      //     });
      //   break;

      case "pn":
        if (this.isPDLValidUrl(this.state.bookid)) {
          const searchParams = new URL(this.state.bookid).searchParams;
          const ID = searchParams.get("ID");
          const categoryID = searchParams.get("CategoryID");
          url = `${host}/check?bookid=${ID}&option=${
            this.state.option +
            (this.state.email ? "&email=" + this.state.email : "")
          }&categoryID=${categoryID}`;
          fetch(url)
            .then((res) => res.json())
            .then((response) => {
              this.setState({
                loader: false,
              });
              if (response.error) Swal("Error!", response.message, "error");
              else Swal("Voila!", response.message, "success");
            });
        } else {
          this.setState({
            loader: false,
          });
          Swal("Opps...", "Enter a valid URL", "error");
        }
        break;

      case "trove":
        url = `${host}/check?bookid=${this.state.bookid}&option=${
          this.state.option +
          (this.state.email ? "&email=" + this.state.email : "")
        }`;
        fetch(url)
          .then((res) => res.json())
          .then((response) => {
            this.setState({
              loader: false,
            });
            if (response.error) Swal("Error!", response.message, "error");
            else Swal("Voila!", response.message, "success");
          });
    }
  };

  render() {
    const { data: session } = this.props.session;
    return (
      <React.Fragment>
        <style jsx global>
          {`
            .main-content {
              width: 100%;
              min-eight: 70vh;
              display: flex;
              justify-content: center;
              align-items: center;
              padding: 3vw;
            }
            .card-container {
              background-color: #efefef;
              min-width: 100%;
              min-height: fit-content;
              border-radius: 1.5vh;
              display: flex;
              align-items: center;
              flex-direction: column;
              padding: 3vw;
              word-wrap: break-all;
            }
            .image {
              margin: 0 2vw 2vw 2vw;
            }
            .input-group-container {
              background: transparent;
              border: 0.35vh solid black;
              border-radius: 0.5vh;
              font-size: 1.8rem;
              margin-bottom: 4vh;
              height: fit-content;
              margin-bottom: 4vh;
            }
            .input-block {
              background: transparent;
              border: 0.3vh solid black;
              border-radius: 0.5vh;
              padding: 0.5vh;
              min-width: 16rem;
              font-size: 1.3rem;
              margin-bottom: 4vh;
              height: fit-content;
            }
            .submit-button {
              background: #3ec6ff !important;
              color: black;
              border: none;
              text-transform: uppercase;
              height: fit-content;
              padding: 1.2vh 2vh;
            }
            .dynamic-input {
              padding: 0;
              background: #c4c4c4;
              min-width: 32vw;
            }
            .left-floating-label {
              position: absolute;
              font-size: 1.25rem;
              top: -1.25vh;
              left: 1.7vw;
              background-color: #efefef;
              z-index: 100;
            }
            .right-floating-label {
              position: absolute;
              font-size: 1.25rem;
              top: -1.3vh;
              right: 7vw;
              background-color: #efefef;
              z-index: 100;
            }
            .helper {
              padding: 1vh;
              font-size: 1.3rem;
              sbackground: transparent;
              border: none;
            }
            select {
              -webkit-appearance: none;
              -moz-appearance: none;
              appearance: none;
              /* Add some styling */

              display: block;
              width: 100%;
              max-width: 320px;
              height: 50px;
              margin: 5px 0px;
              padding: 0px 24px;
              font-size: 16px;
              line-height: 1.75;
              background-image: none;
              border: 1px solid #cccccc;
              -ms-word-break: normal;
              word-break: normal;
            }
            .selector {
              font: 1.6rem "Consolas", monospace;
              color: black;
              -webkit-transform: rotate(90deg);
              -moz-transform: rotate(90deg);
              -ms-transform: rotate(90deg);
              transform: rotate(90deg);
              right: 10px;
              /*Adjust for position however you want*/

              top: 0.9rem;
              padding: 0 0 2px;

              position: absolute;
              pointer-events: none;
            }
            @media only screen and (min-width: 320px) and (max-width: 480px) {
              .image {
                margin: 2vw 5vw 5vw 5vw;
              }
              .right-floating-label {
                right: unset;
                left: 1.7vw;
              }
              .helper {
                display: none;
              }
              .main-content {
                padding: 5vw;
              }
              .selector {
                font: 4vw "Consolas", monospace;
                top: 3vw;
              }
            }
            @media only screen and (min-width: 1440px) and (max-width: 1445px) {
              .selector {
                top: 1.1rem;
                right: 15px;
              }
            }
            @media only screen and (min-width: 1920px) and (max-width: 1925px) {
              .selector {
                top: 1.3rem;
                right: 15px;
              }
            }

            .lds-ellipsis {
              display: inline-block;
              position: relative;
              width: 64px;
              height: 64px;
            }
            .lds-ellipsis div {
              position: absolute;
              top: 27px;
              width: 11px;
              height: 11px;
              border-radius: 50%;
              background: #000;
              animation-timing-function: cubic-bezier(0, 1, 1, 0);
            }
            .lds-ellipsis div:nth-child(1) {
              left: 6px;
              animation: lds-ellipsis1 0.6s infinite;
            }
            .lds-ellipsis div:nth-child(2) {
              left: 6px;
              animation: lds-ellipsis2 0.6s infinite;
            }
            .lds-ellipsis div:nth-child(3) {
              left: 26px;
              animation: lds-ellipsis2 0.6s infinite;
            }
            .lds-ellipsis div:nth-child(4) {
              left: 45px;
              animation: lds-ellipsis3 0.6s infinite;
            }
            @keyframes lds-ellipsis1 {
              0% {
                transform: scale(0);
              }
              100% {
                transform: scale(1);
              }
            }
            @keyframes lds-ellipsis3 {
              0% {
                transform: scale(1);
              }
              100% {
                transform: scale(0);
              }
            }
            @keyframes lds-ellipsis2 {
              0% {
                transform: translate(0, 0);
              }
              100% {
                transform: translate(19px, 0);
              }
            }
          `}
        </style>
        {this.state.loader ? (
          <div className="lds-ellipsis">
            <div />
            <div />
            <div />
            <div />
          </div>
        ) : (
          <div className="col-md-6 main-content">
            <div className="card-container">
              <div className="image">{bookIcon}</div>
              <form onSubmit={this.onSubmit}>
                <div
                  style={{
                    position: "relative",
                    width: "fit-content",
                    maxWidth: "-moz-fit-content",
                  }}
                >
                  <div className="left-floating-label">Choose Library</div>
                  <div className="selector">{">"}</div>
                  <select
                    className="input-block"
                    value={this.state.option}
                    id="option"
                    name="option"
                    required
                    onChange={this.handleChange}
                  >
                    <option value="gb">Google Books</option>
                    <option value="pn">Punjab Digital Library</option>
                    <option value="trove">Trove Digital Library</option>
                  </select>
                </div>

                {/* <h3>
              2. Enter the {this.state.option === "gb" ? "ID" : "URI"} ({this.showExample()}){" "}
              <span> *</span>
            </h3> */}
                <div className="input-group full-width input dynamic-input input-group-container">
                  {this.renderContent(this.state.option)}
                  <div className="input-group-btn">
                    <button
                      type="button"
                      className="btn btn-default dropdown-toggle"
                      data-toggle="dropdown"
                      aria-haspopup="true"
                      aria-expanded="false"
                    >
                      <span className="glyphicon glyphicon-question-sign" />
                    </button>
                    <div className="dropdown-menu well well-sm">
                      <p>{this.showExample()}</p>
                    </div>
                  </div>
                </div>
                {/* <h3>3. Enter E-Mail</h3> */}
                {session && (
                  <div>
                    <button
                      className="btn btn-primary submit-button"
                      type="submit"
                    >
                      Submit
                    </button>
                  </div>
                )}
                {/* !!! the placement of this message banner is to be adjusted when the upload page is redesigned !!! */}
                {!session && (
                  <div
                    className="cdx-message cdx-message--block cdx-message--warning"
                    aria-live="polite"
                  >
                    <span className="cdx-message__icon"></span>
                    <div className="cdx-message__content">
                      <p>
                        You need to log in using your Wikimedia account to
                        upload books
                      </p>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        )}
      </React.Fragment>
    );
  }
}

const BooksWithSession = withSession(Books);

export default BooksWithSession;
