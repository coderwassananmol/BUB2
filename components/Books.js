import React from "react";
import Swal from "sweetalert2";
import ReactDOM from "react-dom";
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
        url = "http://books.google.com";
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
    const styling = {
      mainContent: {
        width: "100%",
        minHeight: "70vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "3vw"
      },
      card: {
        backgroundColor: "#EFEFEF",
        minWidth: "100%",
        minHeight: "fit-content",
        borderRadius: "1.5vh",
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
        padding: "3vw",
        wordWrap: "break-all"
      },
      image: {
        margin: " 0 2vw 2vw 2vw"
      },
      input: {
        background: "transparent",
        border: "1.5px solid black",
        borderRadius: "0.5vh",
        padding: "1.5vh",
        fontSize: "1.8rem",
        marginBottom: "4vh",
        height: "fit-content"
      },
      button: {
        background: "#3EC6FF",
        color: "black",
        border: "none",
        textTransform: "uppercase"
      }
    };

    if (this.state.loader) {
      return (
        <div className="lds-ellipsis">
          <style jsx>
            {`
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
          <div />
          <div />
          <div />
          <div />
        </div>
      );
    }
    return (
      <div className="main-content col-md-6" style={styling.mainContent}>
        <div style={styling.card}>
          <div style={styling.image}>
            <svg
              width="126"
              height="150"
              viewBox="0 0 126 150"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12.222 134.707C12.222 134.707 15.9272 151.181 39.1407 146.965L43.0782 135.945L36.4022 127.566L17.9255 120.523L12.218 134.707"
                fill="#34484C"
              />
              <path
                d="M86.1663 103.842C86.1663 109.673 83.5715 111.211 77.0077 114.405L20.9711 141.729C15.9114 141.727 11.8125 136.999 11.8125 131.161V40.2422C11.8125 34.3992 14.7893 32.4562 20.9711 29.6672L77.0057 2.34375C82.0693 2.34375 86.1643 7.08516 86.1643 12.9187V103.842"
                fill="#244290"
              />
              <path
                d="M16.9037 140.613C16.9037 140.613 37.9043 147.57 39.1387 146.967C40.3574 146.372 38.3532 136.455 38.3532 136.455L30.7578 127.01L23.6782 126.63L22.4359 128.667L16.9037 140.613Z"
                fill="#34484C"
              />
              <path
                d="M75.6926 8.6414L13.5234 38.7961L16.4391 58.1156L25.6903 59.1891L56.5799 53.4492L75.7792 41.8289L89.9148 19.4836C86.8239 13.0898 82.2879 9.1289 75.6926 8.6414Z"
                fill="#F4F5F5"
              />
              <path
                d="M29.9899 45.4805C29.9899 43.7859 30.2537 42.4359 30.7597 41.2852C24.3987 40.5961 18.3881 38.4727 14.0056 33.9141C12.5468 35.4609 11.8302 37.3781 11.8302 40.2399V131.156C11.8302 136.992 15.9409 141.724 20.9927 141.724L30.0352 137.32C30.0332 137.009 29.9919 136.711 29.9919 136.397V45.4805"
                fill="#34484C"
              />
              <path
                d="M105.956 112.798C105.956 118.636 103.353 120.169 96.7995 123.368L39.1348 146.97C34.0751 146.97 29.9683 142.238 29.9683 136.399V45.4805C29.9683 39.6445 32.9451 37.7039 39.1348 34.9008L96.7995 11.3063C101.853 11.3063 105.956 16.0406 105.956 21.8813V112.798Z"
                fill="#20B6F7"
              />
              <path
                d="M82.0792 39.0539C82.1371 39.2309 82.1646 39.42 82.1599 39.6099C82.1553 39.7998 82.1186 39.9866 82.0522 40.1593C81.9857 40.3321 81.8907 40.4871 81.7729 40.6153C81.6552 40.7434 81.5169 40.8421 81.3665 40.9055L50.7032 54.5672C50.3988 54.703 50.0621 54.6934 49.7634 54.5406C49.4648 54.3877 49.2273 54.1033 49.1006 53.7469C49.0423 53.5702 49.0145 53.3813 49.0187 53.1916C49.023 53.0018 49.0592 52.815 49.1254 52.6423C49.1915 52.4695 49.2861 52.3144 49.4036 52.186C49.5211 52.0577 49.6591 51.9589 49.8094 51.8953L80.4766 38.2359C80.7812 38.0991 81.1186 38.1084 81.4175 38.2618C81.7165 38.4153 81.9537 38.701 82.0792 39.0586"
                fill="#244290"
              />
              <path
                d="M82.0798 45.5555C82.1377 45.7325 82.1652 45.9216 82.1606 46.1114C82.1559 46.3013 82.1193 46.4882 82.0528 46.6609C81.9863 46.8336 81.8914 46.9886 81.7736 47.1168C81.6558 47.245 81.5176 47.3437 81.3671 47.407L50.7038 61.0453C50.3996 61.1842 50.0619 61.1761 49.7625 61.0229C49.4632 60.8697 49.2259 60.5834 49.1013 60.225C49.0445 60.049 49.0179 59.8612 49.0229 59.6728C49.0279 59.4843 49.0645 59.299 49.1306 59.1276C49.1966 58.9562 49.2907 58.8022 49.4074 58.6747C49.5241 58.5473 49.661 58.4488 49.81 58.3852L80.4773 44.7234C80.7815 44.5852 81.1191 44.5935 81.4183 44.7467C81.7175 44.8998 81.9548 45.1857 82.0798 45.5437"
                fill="#244290"
              />
              <path
                d="M71.6546 56.9438C71.9007 57.6844 71.7511 58.4367 71.314 58.6313L50.3724 67.9571C49.9354 68.1446 49.3841 67.7063 49.1341 66.9727C48.8899 66.2367 49.0455 65.4774 49.4825 65.2805L70.4241 55.9594C70.8533 55.7719 71.4065 56.2078 71.6546 56.9438Z"
                fill="#244290"
              />
            </svg>
          </div>

          <form onSubmit={this.onSubmit}>
            <div style={{ position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  fontSize: "1.2rem",
                  top: "-1.3vh",
                  left: "1.7vh",
                  backgroundColor: "#EFEFEF"
                }}
              >
                Choose Library
              </div>
              <select
                value={this.state.option}
                id="option"
                name="option"
                required
                onChange={this.handleChange}
                style={{ ...styling.input, minWidth: "25vw" }}
              >
                <option value="gb">Google Books</option>
                <option value="pn">Punjab Digital Library</option>
              </select>
            </div>

            {/* <h3>
              2. Enter the {this.state.option === "gb" ? "ID" : "URI"} ({this.showExample()}){" "}
              <span> *</span>
            </h3> */}
            <div
              className="input-group full-width"
              style={{ ...styling.input, padding: "0", background: "#C4C4C4", minWidth: "32vw" }}
            >
              {this.state.option === "gb" ? (
                <div
                  style={{
                    position: "absolute",
                    fontSize: "1.2rem",
                    top: "-1.3vh",
                    right: "7vw",
                    backgroundColor: "#EFEFEF",
                    zIndex: "100"
                  }}
                >
                  Enter Book ID
                </div>
              ) : (
                <div
                  style={{
                    position: "absolute",
                    fontSize: "1.2rem",
                    top: "-1.3vh",
                    left: "1.3vh",
                    backgroundColor: "#EFEFEF",
                    zIndex: "100"
                  }}
                >
                  Enter URI
                </div>
              )}
              {this.state.option === "gb" ? (
                <span
                  className="input-group-addon"
                  id="bid"
                  style={{
                    padding: "1vh",
                    fontSize: "1.3rem",
                    background: "transparent",
                    border: "none"
                  }}
                >
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
            <div
              className="input-group"
              style={{ ...styling.input, padding: 0, fontSize: "1.8rem" }}
            >
              <div
                style={{
                  position: "absolute",
                  fontSize: "1.2rem",
                  top: "-1.3vh",
                  left: "1.3vh",
                  backgroundColor: "#EFEFEF",
                  zIndex: "100"
                }}
              >
                Enter E-Mail
              </div>
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
              <style jsx>
                {`
                  padding-top: 3vh;
                  padding-bottom: 3vh;
                `}
              </style>
              <button
                className="btn btn-primary"
                type="submit"
                style={{ ...styling.button, height: "fit-content", padding: "1.2vh 2vh" }}
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}
