import React, { useState } from "react";
import Swal from "sweetalert2";
import { host } from "../utils/constants";
import { signIn, useSession } from "next-auth/react";

const Books = () => {
  const { data: session } = useSession();
  const [option, setOption] = useState("gb");
  const [bookid, setBookId] = useState("");
  const [email, setEmail] = useState("");
  const [loader, setLoader] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [IATitle, setIATitle] = useState("");
  const [IAIdentifier, setIAIdentifier] = useState("");
  const [inputDisabled, setInputDisabled] = useState(false);

  const handleChange = (e) => {
    setOption(e.target.value);
    setBookId("");
    setIsDuplicate(false);
    setIATitle("");
    setIAIdentifier("");
    setInputDisabled(false);
  };

  const onResetButtonClicked = () => {
    setIsDuplicate(false);
    setInputDisabled(false);
    setIATitle("");
    setIAIdentifier("");
  };

  const onSwalClosed = () => {
    setInputDisabled(false);
    setIAIdentifier("");
    setIATitle("");
  };

  const renderContent = (option) => {
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
                disabled={inputDisabled}
                placeholder="At46AQAAMAAJ"
                onChange={(e) => setBookId(e.target.value)}
                aria-describedby="bid"
              />
            </div>
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
                disabled={inputDisabled}
                onChange={(e) => setBookId(e.target.value)}
                required
                placeholder="http://www.panjabdigilib.org/webuser/searches/displayPage.jsp?ID=9073&page=1&CategoryID=1&Searched="
              />
            </div>
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
                disabled={inputDisabled}
                placeholder="249146214"
                onChange={(e) => setBookId(e.target.value)}
                required
                aria-describedby="bid"
              />
            </div>
          </>
        );
    }
  };

  const isPDLValidUrl = (urlString) => {
    const urlPattren = new RegExp(
      "((http|https)\\:\\/\\/)(www.)?(panjabdigilib\\.org\\/webuser\\/searches\\/displayPage\\.jsp\\?ID\\=)([0-9]*)(\\&page\\=)([0-9]*)(\\&CategoryID\\=)([0-9]*)(\\&Searched\\=)([a-zA-Z0-9@:%._+~#?&//=]*)"
    );
    return urlPattren.test(urlString);
  };

  const onSubmit = (e, userName) => {
    e.preventDefault();

    if (!userName || userName === "") {
      Swal("Error!", "Log in with Wikimedia to continue", "error");
      return;
    }
    setLoader(true);
    setIsDuplicate(false);
    let url = "";
    switch (option) {
      case "gb":
        url = `${host}/check?bookid=${bookid}&option=${
          option + (email ? "&email=" + email : "")
        }&userName=${userName}&IAtitle=${IAIdentifier}`;
        fetch(url)
          .then((response) => response.json())
          .then(async (response) => {
            setLoader(false);
            if (response.isDuplicate) {
              setIsDuplicate(true);
              setIATitle(response.titleInIA);
              setIsDuplicate(true);
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
                  onClose: onSwalClosed,
                  title: '<h4">Just a few more steps...</h4>',
                  html:
                    `<ol style="text-align: left; font-size: 16px; line-height: 1.5;">` +
                    `<li>Go to this link: <a href = "${response.url}" target="_blank">${response.title}</a></li>` +
                    `<li>Enter the captcha.</li>` +
                    `<li>Enter the URL below (<i>https://books.googleusercontent.com/books/content?req=xxx</i>)</li>`,
                });

                if (url && typeof url !== "object") {
                  setLoader(true);
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
                      setLoader(false);
                      if (response.error)
                        Swal("Error!", response.message, "error");
                      else Swal("Voila!", response.message, "success");
                    });
                }
              }
            }
          });
        break;

      case "pn":
        if (isPDLValidUrl(bookid)) {
          const searchParams = new URL(bookid).searchParams;
          const ID = searchParams.get("ID");
          const categoryID = searchParams.get("CategoryID");
          url = `${host}/check?bookid=${ID}&option=${
            option + (email ? "&email=" + email : "")
          }&categoryID=${categoryID}&userName=${userName}&IAtitle=${IAIdentifier}`;
          fetch(url)
            .then((res) => res.json())
            .then((response) => {
              setLoader(true);
              if (response.isDuplicate) {
                setIsDuplicate(true);
                setIATitle(response.titleInIA);
                setInputDisabled(true);
              } else {
                if (response.error) Swal("Error!", response.message, "error");
                else Swal("Voila!", response.message, "success");
              }
            });
        } else {
          setLoader(false);
          Swal("Opps...", "Enter a valid URL", "error");
        }
        break;

      case "trove":
        url = `${host}/check?bookid=${bookid}&option=${
          option + (email ? "&email=" + email : "")
        }&userName=${userName}&IAtitle=${IAIdentifier}`;
        fetch(url)
          .then((res) => res.json())
          .then((response) => {
            setLoader(false);
            if (response.isDuplicate) {
              setIsDuplicate(true);
              setIATitle(response.titleInIA);
              setInputDisabled(true);
            } else {
              if (response.error) Swal("Error!", response.message, "error");
              else Swal("Voila!", response.message, "success");
            }
          });
    }
  };

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
        <form onSubmit={(e) => onSubmit(e, session.user.name)}>
          <div className="section">
            <h4>1. Select a library</h4>
            <select className="cdx-select" onChange={(e) => handleChange(e)}>
              <option value="gb" selected>
                Google Books
              </option>
              <option value="pn">Panjab Digital Library</option>
              <option value="trove">Trove Digital Library</option>
            </select>
          </div>
          <div className="section">{renderContent(option)}</div>
          {isDuplicate ? (
            <div
              class="cdx-message cdx-message--block cdx-message--warning"
              aria-live="polite"
              style={{ marginTop: "20px", display: "inline-block" }}
            >
              <span class="cdx-message__icon"></span>
              <div class="cdx-message__content">
                A file with this identifier{" "}
                <a href={`https://archive.org/details/${IATitle}`}>
                  (https://archive.org/{IATitle})
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
                    onChange={(e) => setState({ IAIdentifier: e.target.value })}
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
                {isDuplicate === true && (
                  <button
                    onClick={() => onResetButtonClicked()}
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
        {loader ? (
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
};

export default Books;
