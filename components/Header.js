import React, { Component, useState } from "react";
import Link from "next/link";
import { withSession } from "../hooks/withSession";
import { signOut } from "next-auth/react";

const Header = (props) => {
  const [isDropDownOpen, setIsDropDownOpen] = useState(false);
  const { page } = props;
  const { data: session } = props.session;

  const toggleDropDown = () => {
    setIsDropDownOpen(!isDropDownOpen);
  };

  return (
    <div className="marginTop">
      <style jsx>
        {`
          .marginTop {
            margin-top: 20px;
          }
          .user-info__right {
            margin-left: auto !important;
            padding: 0 20px;
            margin-bottom: 20px;
          }
          .user-dropdown {
            position: absolute;
            right: 20px;
            margin-top: 5px;
            background: white;
            border: 1px solid lightgrey;
            width: 150px;
            padding: 1px;
          }
          .user-dropdown p {
            margin: 0;
          }
          .user-dropdown-option {
            display: flex;
            justify-content: space-between;
            cursor: pointer;
            padding: 9px;
          }
          .user-dropdown-option:hover {
            background: #f5f5f56d;
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
                  aria-selected={page === "index" ? "true" : "false"}
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
                  aria-selected={page === "queue" ? "true" : "false"}
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
                  aria-selected={page === "stats" ? "true" : "false"}
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
          {session && (
            <div className="user-info__right">
              <button className="cdx-button" onClick={toggleDropDown}>
                {session && session.user.name}
                <span
                  className="cdx-button__icon cdx-css-icon--expand-icon"
                  aria-hidden="true"
                ></span>
              </button>
              {isDropDownOpen && (
                <div className="user-dropdown">
                  <div className="user-dropdown-option" onClick={signOut}>
                    <p>Logout</p>
                    <span className="cdx-css-icon--logout-icon"></span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const HeaderWithSession = withSession(Header);

export default HeaderWithSession;
