import React from "react";
import Swal from "sweetalert2";
import ReactDOM from "react-dom";
import bookIcon from "./bookIcon";
export default class Books extends React.Component {
  /**
   * @param {Object} props
   * @constructor
   */
  constructor(props) {
    super(props);
    this.state = {
      option: "gb",
      bookid: "",
      show: true,
      loader: false
    };
    this.onSubmit = this.onSubmit.bind(this);
  }

  /**
   * Change the `option` state when user selects a different library
   * @param {Object} event
   */
  handleChange = event => {
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

      case "wb":
        url = "http://westbengal.com";
        break;

      case "pn":
        url =
          "http://www.panjabdigilib.org/webuser/searches/displayPageContent.jsp?ID=xxxx&page=x&CategoryID=x&Searched=xxxx";
        break;
    }
    return url;
  };

  onSubmit = event => {
    event.preventDefault();
    this.setState({
      loader: true
    });

    let url = "";
    switch (this.state.option) {
      case "gb":
        url = `/check?bookid=${this.state.bookid}&option=${this.state.option +
          (this.state.email ? "&email=" + this.state.email : "")}`;
        fetch(url)
          .then(response => response.json())
          .then(async response => {
            this.setState({
              loader: false
            });
            if (response.error) {
              Swal("Error!", response.message, "error");
            } else {
              const { value: url } = await Swal({
                input: "url",
                backdrop: true,
                width: "50%",
                title: '<strong style="font-size: 22px;">Just a few more steps...</strong>',
                html:
                  `<ol style="text-align: left; font-size: 16px; line-height: 1.5">` +
                  `<li>Go to this link: <a href = "${response.url}">${response.title}</a></li>` +
                  `<li>Enter the captcha.</li>` +
                  `<li>Enter the URL below (<i>https://books.googleusercontent.com/books/content?req=xxx</i>)</li>`
              });

              this.setState({
                loader: true
              });

              fetch("/download", {
                body: JSON.stringify({
                  url: url
                }),
                headers: {
                  "Content-Type": "application/json",
                  "Access-Control-Allow-Origin": "*"
                },
                method: "POST"
              })
                .then(response => response.json())
                .then(response => {
                  this.setState({
                    loader: false
                  });
                  if (response.error) Swal("Error!", response.message, "error");
                  else Swal("Voila!", response.message, "success");
                });
            }
          });
        break;

      case "pn":
        const searchParams = new URL(this.state.bookid).searchParams;
        const ID = searchParams.get("ID");
        const categoryID = searchParams.get("CategoryID");
        url = `/check?bookid=${ID}&option=${this.state.option +
          (this.state.email ? "&email=" + this.state.email : "")}&categoryID=${categoryID}`;
        fetch(url)
          .then(res => res.json())
          .then(response => {
            this.setState({
              loader: false
            });
            if (response.error) Swal("Error!", response.message, "error");
            else Swal("Voila!", response.message, "success");
          });
    }
  };

  render() {
    return (
      <React.Fragment>
        <style jsx>
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
              border: 1.5px solid black;
              border-radius: 0.5vh;
              font-size: 1.8rem;
              margin-bottom: 4vh;
              height: fit-content;
              margin-bottom: 4vh;
            }
            .input-block {
              background: transparent;
              border: 1.5px solid black;
              border-radius: 0.5vh;
              padding: 1.5vh;
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
              minwidth: 32vw;
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
              font-size: 1.3rem;s
              background: transparent;
              border: none;
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
                <div style={{ position: "relative" }}>
                  <div className="left-floating-label">Choose Library</div>
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
                  </select>
                </div>

                {/* <h3>
              2. Enter the {this.state.option === "gb" ? "ID" : "URI"} ({this.showExample()}){" "}
              <span> *</span>
            </h3> */}
                <div className="input-group full-width input dynamic-input input-group-container">
                  {this.state.option === "gb" ? (
                    <div className="right-floating-label">Enter Book ID</div>
                  ) : (
                    <div className="right-floating-label">Enter URI</div>
                  )}
                  {this.state.option === "gb" ? (
                    <span className="input-group-addon helper" id="bid">
                      https://books.google.co.in/books?id=
                    </span>
                  ) : null}

                  <input
                    style={{ background: "#EFEFEF", border: "none" }}
                    id="bookid"
                    name="bookid"
                    type={this.state.option === "gb" ? "text" : "url"}
                    placeholder={
                      this.state.option === "gb"
                        ? "At46AQAAMAAJ"
                        : "http://www.panjabdigilib.org/webuser/searches/displayPageContent.jsp?ID=2833&page=1&CategoryID=3&Searched=W3GX"
                    }
                    onChange={event => this.setState({ bookid: event.target.value })}
                    required
                    className="form-control"
                    id="bookid"
                    aria-describedby="bid"
                  />
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
                <div className="input-group input-group-container">
                  <div className="left-floating-label">Enter E-Mail</div>
                  <input
                    style={{ background: "transparent", border: "none" }}
                    type="email"
                    name="email"
                    className="form-control"
                    id="email"
                    placeholder={"example@domain.com"}
                    onChange={event => this.setState({ email: event.target.value })}
                  />
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
                      <p>It will be used to notify that your upload has been completed.</p>
                    </div>
                  </div>
                </div>
                <div>
                  <button className="btn btn-primary submit-button" type="submit">
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </React.Fragment>
    );
  }
}
