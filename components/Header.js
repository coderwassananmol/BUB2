import React, { Component } from "react";
import Link from "next/link";
import Octicon, { Star, RepoForked } from "@primer/octicons-react";
import { withSession } from "../hooks/withSession";
import { signIn, signOut } from "next-auth/react";

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
    const { data: session } = this.props.session;
    return (
      <div>
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
                      </Link>
                    </li>
                    <li>
                      <a href="#">About</a>
                    </li>
                  </ul>
                </li>
                <li>
                  <button
                    type="button"
                    className="cdx-button"
                    style={{ marginTop: 15 }}
                    onClick={() => (session ? signOut() : signIn())}
                  >
                    {session ? "Logout" : "Login"}
                  </button>
                </li>
                <li>
                  <p style={{ marginLeft: 10, marginTop: 20 }}>
                    {session && session?.user?.name}
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </div>
    );
  }
}

const HeaderWithSession = withSession(Header);

export default HeaderWithSession;
