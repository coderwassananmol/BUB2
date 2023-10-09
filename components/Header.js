import React, { useState } from "react";
import Link from "next/link";
import { header_links } from "../utils/constants";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";

const Header = (props) => {
  const { page } = props;
  const { data: session } = useSession();
  const [isDropDownOpen, setIsDropDownOpen] = useState(false);

  const toggleDropDown = () => {
    setIsDropDownOpen(!toggleDropDown);
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
            {header_links.map((link, i) => (
              <Link key={i} href={`${link?.href}`}>
                <li
                  id={`${link?.id}-label`}
                  className="cdx-tabs__list__item"
                  role="presentation"
                >
                  <label
                    htmlFor={`${link?.id}-input`}
                    role="tab"
                    aria-selected={
                      (page === "index" && i === 0) ||
                      page === link?.name.toLowerCase()
                        ? "true"
                        : "false"
                    }
                  >
                    {link?.name}
                  </label>
                </li>
              </Link>
            ))}
          </ul>
          {session && (
            <div className="user-info__right">
              <button className="cdx-button" onClick={() => toggleDropDown()}>
                {session && session.user.name}
                <span
                  className="cdx-button__icon cdx-css-icon--expand-icon"
                  aria-hidden="true"
                ></span>
              </button>
              {isDropDownOpen && (
                <div className="user-dropdown">
                  <div
                    className="user-dropdown-option"
                    onClick={() => signOut()}
                  >
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

export default Header;
