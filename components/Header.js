import React, { Component } from "react";
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
      <div className="marginTop">
        <style jsx>
          {`
            .marginTop {
              margin-top: 20px;
            }
          `}
        </style>
        <div className="cdx-tabs">
          <div className="cdx-tabs__header">
            <ul
              className="cdx-tabs__list"
              role="tablist"
              aria-activedescendant="form-tabs-1"
            >
              <Link href="/">
                <li
                  id="form-tabs-1-label"
                  className="cdx-tabs__list__item"
                  role="presentation"
                >
                  <label
                    for="form-tabs-1-input"
                    role="tab"
                    aria-selected={
                      this.props.page === "index" ? "true" : "false"
                    }
                  >
                    Upload
                  </label>
                </li>
              </Link>
              <Link href="/queue">
                <li
                  id="form-tabs-2-label"
                  className="cdx-tabs__list__item"
                  role="presentation"
                >
                  <label
                    for="form-tabs-2-input"
                    role="tab"
                    aria-selected={
                      this.props.page === "queue" ? "true" : "false"
                    }
                  >
                    Queue
                  </label>
                </li>
              </Link>
              <Link href="/stats">
                <li
                  id="form-tabs-3-label"
                  className="cdx-tabs__list__item"
                  role="presentation"
                >
                  <label
                    for="form-tabs-3-input"
                    role="tab"
                    aria-selected={
                      this.props.page === "stats" ? "true" : "false"
                    }
                  >
                    Stats
                  </label>
                </li>
              </Link>
              {/* <Link href="/faq">
                <li
                  id="form-tabs-3-label"
                  className="cdx-tabs__list__item"
                  role="presentation"
                >
                  <label
                    for="form-tabs-3-input"
                    role="tab"
                    aria-selected={this.props.page === "faq" ? "true" : "false"}
                  >
                    FAQ
                  </label>
                </li>
              </Link> */}
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

export default Header;
