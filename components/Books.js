import React from "react";
import Swal from "sweetalert2";
import { host } from "../utils/constants";
import { withSession } from "../hooks/withSession";
import { signIn } from "next-auth/react";
import InputEmail from "./InputEmail";

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
      isDuplicate: false,
      IATitle: "",
      IAIdentifier: "",
      inputDisabled: false,
    };
    this.onSubmit = this.onSubmit.bind(this);
  }

  /**
   * Change the `option` state when user selects a different library
   * @param {Object} event
   */
  handleChange = (event) => {
    this.setState({
      option: event.target.value,
      bookid: "",
      isDuplicate: false,
      IATitle: "",
      IAIdentifier: "",
      inputDisabled: false,
    });
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

  onResetButtonClicked = () => {
    this.setState({
      isDuplicate: false,
      inputDisabled: false,
      IATitle: "",
      IAIdentifier: "",
    });
  };

  onSwalClosed = () => {
    this.setState({
      inputDisabled: false,
      IAIdentifier: "",
      IATitle: "",
    });
  };

  renderContent = (option) => {
    switch (option) {
      case "gb":
        return (
          <>
            <h4>2. Enter Google Books ID</h4>
            <div className="cdx-text-input input-group">
              <span className="input-group-addon helper" id="bid">
                https://books.google.co.in/books?id=
              </span>
              <input
                className="cdx-text-input__input"
                id="bookid"
                name="bookid"
                type="text"
                required
                disabled={this.state.inputDisabled}
                placeholder="At46AQAAMAAJ"
                onChange={(event) =>
                  this.setState({ bookid: event.target.value })
                }
                aria-describedby="bid"
              />
            </div>
            <InputEmail
              inputDisabled={this.state.inputDisabled}
              handleChange={(event) =>
                this.setState({ email: event.target.value })
              }
            />
          </>
        );

      case "pn":
        return (
          <>
            <h4>2. Enter URI</h4>
            <div className="cdx-text-input">
              <input
                className="cdx-text-input__input"
                type="text"
                id="bookid"
                name="bookid"
                disabled={this.state.inputDisabled}
                onChange={(event) =>
                  this.setState({ bookid: event.target.value })
                }
                required
                placeholder="http://www.panjabdigilib.org/webuser/searches/displayPage.jsp?ID=9073&page=1&CategoryID=1&Searched="
              />
            </div>
            <InputEmail
              inputDisabled={this.state.inputDisabled}
              handleChange={(event) =>
                this.setState({ email: event.target.value })
              }
            />
          </>
        );

      case "trove":
        return (
          <>
            <h4>2. Enter Newspaper/Gazette Article ID</h4>
            <div className="cdx-text-input input-group">
              <span className="input-group-addon helper" id="bid">
                https://trove.nla.gov.au/newspaper/article/
              </span>
              <input
                className="cdx-text-input__input"
                id="bookid"
                name="bookid"
                type="text"
                disabled={this.state.inputDisabled}
                placeholder="249146214"
                onChange={(event) =>
                  this.setState({ bookid: event.target.value })
                }
                required
                aria-describedby="bid"
              />
            </div>
            <InputEmail
              inputDisabled={this.state.inputDisabled}
              handleChange={(event) =>
                this.setState({ email: event.target.value })
              }
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

  onSubmit = (event, userName) => {
    event.preventDefault();

    if (!userName || userName === "") {
      Swal("Error!", "Log in with Wikimedia to continue", "error");
      return;
    }

    this.setState({
      loader: true,
      isDuplicate: false,
    });

    let url = "";
    switch (this.state.option) {
      case "gb":
        url = `${host}/check?bookid=${this.state.bookid}&option=${
          this.state.option +
          (this.state.email ? "&email=" + this.state.email : "")
        }&userName=${userName}&IAtitle=${this.state.IAIdentifier}`;
        fetch(url)
          .then((response) => response.json())
          .then(async (response) => {
            this.setState({
              loader: false,
            });
            if (response.isDuplicate) {
              this.setState({
                isDuplicate: true,
                IATitle: response.titleInIA,
                inputDisabled: true,
              });
            } else {
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
                  onClose: this.onSwalClosed,
                  title: '<h4">Just a few more steps...</h4>',
                  html:
                    `<ol style="text-align: left; font-size: 16px; line-height: 1.5;">` +
                    `<li>Go to this link: <a href = "${response.url}" target="_blank">${response.title}</a></li>` +
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
                      titleInIA: response.IAIdentifier,
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
          }&categoryID=${categoryID}&userName=${userName}&IAtitle=${
            this.state.IAIdentifier
          }`;
          fetch(url)
            .then((res) => res.json())
            .then((response) => {
              this.setState({
                loader: false,
              });
              if (response.isDuplicate) {
                this.setState({
                  isDuplicate: true,
                  IATitle: response.titleInIA,
                  inputDisabled: true,
                });
              } else {
                if (response.error) Swal("Error!", response.message, "error");
                else Swal("Voila!", response.message, "success");
              }
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
        }&userName=${userName}&IAtitle=${this.state.IAIdentifier}`;
        fetch(url)
          .then((res) => res.json())
          .then((response) => {
            this.setState({
              loader: false,
            });
            if (response.isDuplicate) {
              this.setState({
                isDuplicate: true,
                IATitle: response.titleInIA,
                inputDisabled: true,
              });
            } else {
              if (response.error) Swal("Error!", response.message, "error");
              else Swal("Voila!", response.message, "success");
            }
          });
    }
  };
  render() {
    const { data: session } = this.props.session;
    return (
      <React.Fragment>
        <div className="main-content">
          <h2>Book Uploader Bot</h2>
          <div className="cdx-label">
            <span className="cdx-label__description">
              Upload books, newspapers, magazines etc. from public libraries to
              Internet Archive
            </span>
          </div>
          <form onSubmit={(e) => this.onSubmit(e, session.user.name)}>
            <div className="section">
              <h4>1. Select a library</h4>
              <select className="cdx-select" onChange={this.handleChange}>
                <option value="gb" selected>
                  Google Books
                </option>
                <option value="pn">Panjab Digital Library</option>
                <option value="trove">Trove Digital Library</option>
              </select>
            </div>
            <div className="section">
              {this.renderContent(this.state.option)}
            </div>
            {this.state.isDuplicate ? (
              <div
                class="cdx-message cdx-message--block cdx-message--warning"
                aria-live="polite"
                style={{ marginTop: "20px", display: "inline-block" }}
              >
                <span class="cdx-message__icon"></span>
                <div class="cdx-message__content">
                  A file with this identifier{" "}
                  <a href={`https://archive.org/details/${this.state.IATitle}`}>
                    (https://archive.org/{this.state.IATitle})
                  </a>{" "}
                  already exists at Internet Archive. Please enter a different
                  identifier to proceed.
                  <div className="cdx-text-input input-group">
                    <span className="input-group-addon helper" id="bid">
                      https://archive.org/details/
                    </span>
                    <input
                      className="cdx-text-input__input"
                      type="text"
                      id="IAIdentifier"
                      name="IAIdentifier"
                      onChange={(event) =>
                        this.setState({ IAIdentifier: event.target.value })
                      }
                      required
                      placeholder="Enter unique file identifier"
                    />
                  </div>
                </div>
              </div>
            ) : null}
            {session && (
              <div>
                <div style={{ marginTop: 20, marginRight: 20 }}>
                  <button className="cdx-button cdx-button--action-progressive cdx-button--weight-primary">
                    Submit
                  </button>
                  {this.state.isDuplicate === true && (
                    <button
                      onClick={this.onResetButtonClicked}
                      style={{ marginLeft: 40 }}
                      className="cdx-button cdx-button--action-progressive cdx-button--weight-primary"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            )}
            {!session && (
              <div style={{ marginTop: 20 }}>
                <div className="cdx-label">
                  <span className="cdx-label__description">
                    Upload restricted. Login with Wikimedia Account to continue.
                  </span>
                </div>
                <button
                  className="cdx-button"
                  style={{ padding: "1rem" }}
                  onClick={(e) => {
                    e.preventDefault();
                    signIn("wikimedia");
                  }}
                >
                  <span
                    className="cdx-button__icon cdx-css-icon--wikimedia-icon"
                    aria-hidden="true"
                  ></span>
                  Login with Wikimedia
                </button>
              </div>
            )}
          </form>
          {this.state.loader ? (
            <div className="loader">
              <span className="cdx-label__description">
                Fetching information. Please wait..
              </span>
              <div
                className="cdx-progress-bar cdx-progress-bar--inline"
                role="progressbar"
                aria-valuemin="0"
                aria-valuemax="100"
              >
                <div className="cdx-progress-bar__bar" />
              </div>
            </div>
          ) : null}
        </div>
      </React.Fragment>
    );
  }
}

const BooksWithSession = withSession(Books);

export default BooksWithSession;
