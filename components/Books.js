import React, { useState } from "react";
import Swal from "sweetalert2";
import { host } from "../utils/constants";
import { useSession, signIn } from "next-auth/react";

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

  const handleChange = (event) => {
    setOption(event.target.value);
    setBookId("");
    setIsDuplicate(false);
    setIATitle("");
    setIAIdentifier("");
    setInputDisabled(false);
  };

  const showExample = () => {
    let url = "";
    switch (option) {
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

      default:
        break;
    }
    return url;
  };

  const validateGoogleBook = (enteredId) => {
    let googleUrl = `https://www.googleapis.com/books/v1/volumes/${enteredId}`;
    fetch(googleUrl)
      .then((response) => response.json())
      .then((details) => {
        if (details.error && details.error.code === 404) {
          alert("The volume ID could not be found.");
        } else if (details.error) {
          alert("Please give a valid volume ID.");
        } else {
          setBookId(details.id);
          setIATitle(details.volumeInfo.title);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const onResetButtonClicked = () => {
    setIsDuplicate(false);
    setInputDisabled(false);
    setIAIdentifier("");
    setIATitle("");
  };

  const onSwalClosed = () => {
    setInputDisabled(false);
    setIAIdentifier("");
    setIATitle("");
  };

  const renderContent = () => {
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
                value={bookid}
                onChange={(event) => setBookId(event.target.value)}
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
                value={bookid}
                onChange={(event) => setBookId(event.target.value)}
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
                value={bookid}
                onChange={(event) => setBookId(event.target.value)}
                required
                aria-describedby="bid"
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  const isPDLValidUrl = (urlString) => {
    var urlPattern = new RegExp(
      "((http|https)\\:\\/\\/)(www.)?(panjabdigilib\\.org\\/webuser\\/searches\\/displayPage\\.jsp\\?ID\\=)([0-9]*)(\\&page\\=)([0-9]*)(\\&CategoryID\\=)([0-9]*)(\\&Searched\\=)([a-zA-Z0-9@:%._+~#?&//=]*)"
    );
    return urlPattern.test(urlString);
  };

  const onSubmit = async (event) => {
    event.preventDefault();

    if (!session || !session.user.name) {
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
        }&userName=${session.user.name}&IAtitle=${IAIdentifier}`;
        try {
          const response = await fetch(url);
          const responseData = await response.json();
          setLoader(false);

          if (responseData.isDuplicate) {
            setIsDuplicate(true);
            setIATitle(responseData.titleInIA);
            setInputDisabled(true);
          } else {
            if (responseData.error) {
              Swal("Error!", responseData.message, "error");
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
                  `<li>Go to this link: <a href="${responseData.url}" target="_blank">${responseData.title}</a></li>` +
                  `<li>Enter the captcha.</li>` +
                  `<li>Enter the URL below (<i>https://books.googleusercontent.com/books/content?req=xxx</i>)</li>`,
              });

              if (url && typeof url !== "object") {
                setLoader(true);
                const downloadResponse = await fetch(`${host}/download`, {
                  body: JSON.stringify({
                    url: url,
                    titleInIA: responseData.IAIdentifier,
                  }),
                  headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                  },
                  method: "POST",
                });

                const downloadData = await downloadResponse.json();
                setLoader(false);

                if (downloadData.error) {
                  Swal("Error!", downloadData.message, "error");
                } else {
                  Swal("Voila!", downloadData.message, "success");
                }
              }
            }
          }
        } catch (error) {
          console.error(error);
        }
        break;

      case "pn":
        if (isPDLValidUrl(bookid)) {
          const searchParams = new URL(bookid).searchParams;
          const ID = searchParams.get("ID");
          const categoryID = searchParams.get("CategoryID");
          url = `${host}/check?bookid=${ID}&option=${
            option + (email ? "&email=" + email : "")
          }&categoryID=${categoryID}&userName=${
            session.user.name
          }&IAtitle=${IAIdentifier}`;
          try {
            const response = await fetch(url);
            const responseData = await response.json();
            setLoader(false);

            if (responseData.isDuplicate) {
              setIsDuplicate(true);
              setIATitle(responseData.titleInIA);
              setInputDisabled(true);
            } else {
              if (responseData.error) {
                Swal("Error!", responseData.message, "error");
              } else {
                Swal("Voila!", responseData.message, "success");
              }
            }
          } catch (error) {
            console.error(error);
          }
        } else {
          setLoader(false);
          Swal("Opps...", "Enter a valid URL", "error");
        }
        break;

      case "trove":
        url = `${host}/check?bookid=${bookid}&option=${
          option + (email ? "&email=" + email : "")
        }&userName=${session.user.name}&IAtitle=${IAIdentifier}`;
        try {
          const response = await fetch(url);
          const responseData = await response.json();
          setLoader(false);

          if (responseData.isDuplicate) {
            setIsDuplicate(true);
            setIATitle(responseData.titleInIA);
            setInputDisabled(true);
          } else {
            if (responseData.error) {
              Swal("Error!", responseData.message, "error");
            } else {
              Swal("Voila!", responseData.message, "success");
            }
          }
        } catch (error) {
          console.error(error);
        }
        break;

      default:
        break;
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
        <form onSubmit={(e) => onSubmit(e)}>
          <div className="section">
            <h4>1. Select a library</h4>
            <select
              className="cdx-select"
              onChange={handleChange}
              value={option}
            >
              <option value="gb">Google Books</option>
              <option value="pn">Panjab Digital Library</option>
              <option value="trove">Trove Digital Library</option>
            </select>
          </div>
          <div className="section">{renderContent()}</div>
          {isDuplicate && (
            <div
              className="cdx-message cdx-message--block cdx-message--warning"
              aria-live="polite"
              style={{ marginTop: "20px", display: "inline-block" }}
            >
              <span className="cdx-message__icon"></span>
              <div className="cdx-message__content">
                A file with this identifier{" "}
                <a
                  href={`https://archive.org/details/${IATitle}`}
                  target="_blank"
                >
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
                    onChange={(event) => setIAIdentifier(event.target.value)}
                    required
                    placeholder="Enter unique file identifier"
                  />
                </div>
              </div>
            </div>
          )}
          {session && (
            <div>
              <div style={{ marginTop: 20, marginRight: 20 }}>
                <button className="cdx-button cdx-button--action-progressive cdx-button--weight-primary">
                  Submit
                </button>
                {isDuplicate === true && (
                  <button
                    onClick={onResetButtonClicked}
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
