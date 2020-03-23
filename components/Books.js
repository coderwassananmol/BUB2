import React from "react";
import Swal from "sweetalert2";
import ReactDOM from 'react-dom';
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
        url = "http://www.panjabdigilib.org/webuser/searches/displayPageContent.jsp?ID=xxxx&page=x&CategoryID=x&Searched=xxxx";
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
      case 'gb':
        url = `/check?bookid=${this.state.bookid}&option=${this.state.option + (this.state.email ? '&email=' + this.state.email : '')}`;
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
                title:
                  '<strong style="font-size: 22px;">Just a few more steps...</strong>',
                html:
                  `<ol style="text-align: left; font-size: 16px; line-height: 1.5">` +
                  `<li>Go to this link: <a href = "${response.url}">${
                  response.title
                  }</a></li>` +
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
                  if (response.error)
                    Swal("Error!", response.message, "error");
                  else
                    Swal("Voila!", response.message, "success");
                });
            }
          });
          break;

      case 'pn':
        const searchParams = new URL(this.state.bookid).searchParams;
        const ID = searchParams.get('ID');
        const categoryID = searchParams.get('CategoryID');
        url = `/check?bookid=${ID}&option=${this.state.option + (this.state.email ? '&email=' + this.state.email : '')}&categoryID=${categoryID}`;
        fetch(url)
          .then(res => res.json())
          .then(response => {
            this.setState({
              loader: false
            });
            if (response.error)
              Swal("Error!", response.message, "error");
            else
              Swal("Voila!", response.message, "success");
          })
    }
  };

  render() {
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
      <div className="col-md-6">
        <form onSubmit={this.onSubmit}>
          <h3>
            1. Choose the library:<span> *</span>
          </h3>
          <select
            value={this.state.option}
            id="option"
            name="option"
            required
            onChange={this.handleChange}
          >
            <option value="gb">Google Books</option>
            <option value="pn">Punjab Digital Library</option>
          </select>
          <h3>
            2. Enter the {this.state.option === 'gb' ? 'ID' : 'URI'} ({this.showExample()}) <span> *</span>
          </h3>
          <div className="input-group full-width">
            <style jsx>
              {
                `
              .full-width {
                width: 100%
              }
              `
              }
            </style>
            {
              this.state.option === 'gb' ?
                <span className="input-group-addon" id="bid">
                  https://books.google.co.in/books?id=
            </span>
                : null
            }

            <input
              id="bookid"
              name="bookid"
              type={this.state.option === 'gb' ? 'text' : 'url'}
              placeholder={this.state.option === 'gb' ? "At46AQAAMAAJ" : 'http://www.panjabdigilib.org/webuser/searches/displayPageContent.jsp?ID=2833&page=1&CategoryID=3&Searched=W3GX'}
              onChange={event => this.setState({ bookid: event.target.value })}
              required
              className="form-control"
              id="bookid"
              aria-describedby="bid"
            />
          </div>
          <h3>3. Enter E-Mail</h3>
          <div className="input-group">
            <input
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
                <p>
                  It will be used to notify that your upload has been completed.
                </p>
              </div>
            </div>
          </div>
          <div>
          <style jsx>
              {
                `
              padding-top: 3vh;
              padding-bottom: 3vh;
              `
              }
            </style>
          <button className="btn btn-primary" type="submit" style={{height: 'fit-content', padding: '1.2vh 2vh'}}>
            Submit
          </button>
          </div>

        </form>
      </div>
    );
  }
}
