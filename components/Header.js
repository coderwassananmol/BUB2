import React, { Component } from "react";
import Head from "next/head";
import Link from "next/link";
import Octicon, { Star, RepoForked } from "@primer/octicons-react";

class Header extends Component {
  constructor() {
    super();
    this.state = {
      gitstats: {},
    };
  }
  componentDidMount() {
    fetch("https://api.github.com/repos/coderwassananmol/BUB2")
      .then((response) => response.json())
      .then((data) => {
        this.setState({
          gitstats: data,
        });
      });
  }
  render() {
    return (
      <div>
        <Head>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
          ></meta>
          <link
            rel="stylesheet"
            href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css"
            integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u"
            crossOrigin="anonymous"
          />

          <link
            rel="stylesheet"
            href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.min.css"
            integrity="sha384-rHyoN1iRsVXV4nD0JutlnGaslCJuC7uwjduW9SVrLvRYooPp2bWYgmgJQIXwl/Sp"
            crossOrigin="anonymous"
          />
          <link
            href="https://fonts.googleapis.com/css?family=Montserrat:300|Open+Sans:300|Raleway:300|Lato:700"
            rel="stylesheet"
          />

          {/* Favicons */}
          <meta
            name="msapplication-TileImage"
            content="assets/mstile-150x150.png"
          />
          <link rel="shortcut icon" href="assets/favicon.ico" />
          <link rel="icon" type="image/png" href="assets/favicon.ico" />
          <link
            rel="icon"
            sizes="196x196"
            href="assets/apple-touch-icon.png"
          ></link>
        </Head>
        <nav className="navbar navbar-default" style={{ marginBottom: "0px" }}>
          <div className="container-fluid">
            <div className="navbar-header">
              <button
                type="button"
                className="navbar-toggle collapsed"
                data-toggle="collapse"
                data-target="#bs-example-navbar-collapse-1"
                aria-expanded="false"
              >
                <span className="sr-only">Toggle navigation</span>
                <span className="icon-bar"></span>
                <span className="icon-bar"></span>
                <span className="icon-bar"></span>
              </button>
            </div>

            <div
              className="collapse navbar-collapse"
              id="bs-example-navbar-collapse-1"
            >
              <ul className="nav navbar-nav">
                <li className={this.props.page === "index" ? "active" : null}>
                  <Link href="/">
                    <a>
                      Upload<span className="sr-only">(current)</span>
                    </a>
                  </Link>
                </li>
                <li className={this.props.page === "queue" ? "active" : null}>
                  <Link href="/queue">
                    <a>Queue</a>
                  </Link>
                </li>
                <li className={this.props.page === "stats" ? "active" : null}>
                  <Link href="/stats">
                    <a>Stats</a>
                  </Link>
                </li>
              </ul>
              <ul className="nav navbar-nav navbar-right">
                <li>
                  <a href="https://github.com/coderwassananmol/BUB2/">
                    <button type="button" className="btn btn-primary">
                      <Octicon icon={Star} />
                      <b> Star </b>
                      <span className="badge badge-light">
                        {this.state.gitstats.stargazers_count}
                      </span>
                    </button>
                  </a>
                </li>
                <li>
                  <a href="https://github.com/coderwassananmol/BUB2/fork">
                    <button type="button" className="btn btn-primary">
                      <Octicon icon={RepoForked} />
                      <b> Fork </b>
                      <span className="badge badge-light">
                        {this.state.gitstats.forks_count}
                      </span>
                    </button>
                  </a>
                </li>
                <li className="dropdown">
                  <a
                    href="#"
                    className="dropdown-toggle"
                    data-toggle="dropdown"
                    role="button"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    Help<span className="caret"></span>
                  </a>
                  <ul className="dropdown-menu">
                    <li>
                      <Link href="/faq">
                        <a>FAQ</a>
                      </li>
                      <li>
                        <a href="#">About</a>
                      </li>
                    </ul>
                  </li>
                </ul>
              </div>
            </div>
          </nav>
        </div>
      </div>
    );
  }
}

export default Header;
