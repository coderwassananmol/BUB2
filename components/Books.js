import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { host } from "../utils/constants";
import { useSession, signIn } from "next-auth/react";
import ChangeIdentifier from "./ChangeIdentifier";
import useMetadataForUI from "../hooks/useMetadataForUI";
import BooksWrapper from "./BooksWrapper";
import { Box, Tooltip } from "@mui/material";

const Books = () => {
  const { data: session } = useSession();
  const [option, setOption] = useState("gb");
  const [bookid, setBookId] = useState("");
  const [email, setEmail] = useState("");
  const [loader, setLoader] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [isInValidIdentifier, setIsInValidIdentifier] = useState(false);
  const [isEmailNotification, setIsEmailNotification] = useState(false);
  const [isUploadCommons, setIsUploadCommons] = useState(false);
  const [IATitle, setIATitle] = useState("");
  const [IAIdentifier, setIAIdentifier] = useState("");
  const [inputDisabled, setInputDisabled] = useState(false);
  const [isUserEmailable, setIsUserEmailable] = useState(false);
  const [isCommonsMetadataReady, setIsCommonsMetadataReady] = useState(false);
  const [hasCommonsMetadataUpdated, setHasCommonsMetadataUpdated] = useState(
    false
  );
  const [commonsMetadata, setCommonsMetadata] = useState();
  const { getMetadataForUI } = useMetadataForUI();

  const handleChange = (event) => {
    setOption(event.target.value);
    setBookId("");
    setIsDuplicate(false);
    setIsEmailNotification(false);
    setIsInValidIdentifier(false);
    setIATitle("");
    setIAIdentifier("");
    setInputDisabled(false);
    setIsUploadCommons(false);
  };

  const onResetButtonClicked = () => {
    setIsDuplicate(false);
    setIsEmailNotification(false);
    setIsInValidIdentifier(false);
    setInputDisabled(false);
    setIATitle("");
    setIAIdentifier("");
    setIsUploadCommons(false);
    setIsCommonsMetadataReady(false);
    setHasCommonsMetadataUpdated(false);
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
                onChange={(event) => setBookId(event.target.value)}
                required
                aria-describedby="bid"
              />
            </div>
          </>
        );
    }
  };

  const isPDLValidUrl = (urlString) => {
    var urlPattren = new RegExp(
      "((http|https)\\:\\/\\/)(www.)?(panjabdigilib\\.org\\/webuser\\/searches\\/displayPage\\.jsp\\?ID\\=)([0-9]*)(\\&page\\=)([0-9]*)(\\&CategoryID\\=)([0-9]*)(\\&Searched\\=)([a-zA-Z0-9@:%._+~#?&//=]*)"
    );
    return urlPattren.test(urlString);
  };

  const checkEmailableStatus = async (username) => {
    const response = await fetch(
      `${host}/checkEmailableStatus?username=${username}`
    );
    const isEmailable = await response.json();
    return isEmailable;
  };

  const onSubmit = async (event) => {
    event?.preventDefault();

    if (!session.user.name || session.user.name === "") {
      Swal("Error!", "Log in with Wikimedia to continue", "error");
      return;
    }

    setLoader(true);
    setIsDuplicate(false);
    setIsInValidIdentifier(false);

    let url = "";
    switch (option) {
      case "gb":
        if (isUploadCommons && !hasCommonsMetadataUpdated) {
          const commonsMetadata = await getMetadataForUI("gb", bookid);
          setCommonsMetadata(commonsMetadata);
          setIsCommonsMetadataReady(true);
        } else {
          url = `${host}/check?bookid=${bookid}&option=${
            option + (email ? "&email=" + email : "")
          }&userName=${
            session?.user?.name
          }&IAtitle=${IAIdentifier}&isEmailNotification=${isEmailNotification}&isUploadCommons=${isUploadCommons}&oauthToken=${
            session?.accessToken
          }&commonsMetadata=${commonsMetadata}`;
          fetch(url)
            .then((response) => response.json())
            .then(async (response) => {
              setLoader(false);
              if (response.isDuplicate) {
                setIsDuplicate(true);
                setIATitle(response.titleInIA);
                setInputDisabled(true);
              } else if (response.isInValidIdentifier) {
                setIsInValidIdentifier(true);
                setIATitle(response.titleInIA);
                setInputDisabled(true);
              } else {
                if (response.error) {
                  Swal("Error!", response.message, "error");
                } else {
                  setIsCommonsMetadataReady(false);
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
          }&IAtitle=${IAIdentifier}&isEmailNotification=${isEmailNotification}`;
          fetch(url)
            .then((res) => res.json())
            .then((response) => {
              setLoader(false);
              if (response.isDuplicate) {
                setIsDuplicate(true);
                setIATitle(response.titleInIA);
                setInputDisabled(true);
              } else if (response.isInValidIdentifier) {
                setIsInValidIdentifier(true);
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
        if (isUploadCommons && !hasCommonsMetadataUpdated) {
          const commonsMetadata = await getMetadataForUI("trove", bookid);
          setCommonsMetadata(commonsMetadata);
          setIsCommonsMetadataReady(true);
        } else {
          url = `${host}/check?bookid=${bookid}&option=${
            option + (email ? "&email=" + email : "")
          }&userName=${
            session.user.name
          }&IAtitle=${IAIdentifier}&isUploadCommons=${isUploadCommons}&oauthToken=${
            session?.accessToken
          }&isEmailNotification=${isEmailNotification}`;
          fetch(url)
            .then((res) => res.json())
            .then((response) => {
              setLoader(false);
              if (response.isDuplicate) {
                setIsDuplicate(true);
                setIATitle(response.titleInIA);
                setInputDisabled(true);
              } else if (response.isInValidIdentifier) {
                setIsInValidIdentifier(true);
                setIATitle(response.titleInIA);
                setInputDisabled(true);
              } else {
                if (response.error) {
                  Swal("Error!", response.message, "error");
                } else {
                  setIsCommonsMetadataReady(false);
                  Swal("Voila!", response.message, "success");
                }
              }
            });
        }

        break;
    }
  };

  useEffect(async () => {
    const isEmailable = await checkEmailableStatus(session?.user?.name);
    setIsUserEmailable(isEmailable);
  }, [session]);

  useEffect(() => {
    if (
      hasCommonsMetadataUpdated &&
      isUploadCommons &&
      isCommonsMetadataReady
    ) {
      onSubmit(null, session.user.name);
    }
    if (isUploadCommons === false && isCommonsMetadataReady) {
      onResetButtonClicked();
      setLoader(false);
    }
  }, [hasCommonsMetadataUpdated, isUploadCommons]);

  return (
    <React.Fragment>
      <BooksWrapper isCommonsMetadataReady={isCommonsMetadataReady}>
        <Box
          sx={{
            minHeight: "auto !important",
            paddingBottom: "0 !important",
            "@media (max-width: 600px)": {
              paddingX: "0 !important",
            },
          }}
          className="main-content"
        >
          <h2>Book Uploader Bot</h2>
          <div className="cdx-label">
            <span className="cdx-label__description">
              Upload books, newspapers, magazines etc. from public libraries to
              Internet Archive and Wikimedia Commons.
            </span>
          </div>
          <form onSubmit={(e) => onSubmit(e, session.user.name)}>
            <div className="section">
              <h4>1. Select a library</h4>
              <select className="cdx-select" onChange={handleChange}>
                <option value="gb" selected>
                  Google Books
                </option>
                <option value="pn">Panjab Digital Library</option>
                <option value="trove">Trove Digital Library</option>
              </select>
            </div>
            <div className="section">{renderContent(option)}</div>

            <div style={{ marginTop: "25px" }} className="section">
              <span class="cdx-checkbox">
                <input
                  id="checkbox-description-css-only-1"
                  class="cdx-checkbox__input"
                  type="checkbox"
                  aria-describedby="cdx-description-css-1"
                  checked={isUploadCommons}
                  onChange={(event) => setIsUploadCommons(event.target.checked)}
                />
                <span class="cdx-checkbox__icon"></span>

                <div
                  style={{ display: "flex", gap: "10px" }}
                  class="cdx-checkbox__label cdx-label"
                >
                  <label
                    for="checkbox-description-css-only-1"
                    class="cdx-label__label"
                  >
                    Upload to Wikimedia Commons
                  </label>

                  <Tooltip
                    placement="right"
                    arrow={true}
                    title={
                      <span style={{ fontSize: "14px" }}>
                        BUB2 will also upload book and metadata to Commons
                      </span>
                    }
                  >
                    <span
                      id="cdx-description-css-1"
                      class="cdx-label__description"
                    >
                      <span class="cdx-css-icon--info-filled"></span>
                    </span>
                  </Tooltip>
                </div>
              </span>
            </div>

            <div style={{ marginTop: "10px" }} className="section">
              <span class="cdx-checkbox">
                <input
                  id="checkbox-description-css-only-1"
                  class="cdx-checkbox__input"
                  type="checkbox"
                  aria-describedby="cdx-description-css-1"
                  onChange={(event) =>
                    setIsEmailNotification(event.target.checked)
                  }
                  disabled={!isUserEmailable}
                  title={
                    isUserEmailable
                      ? ""
                      : "No email associated with this user account or the user has disabled email access."
                  }
                />
                <span class="cdx-checkbox__icon"></span>
                <div
                  class="cdx-checkbox__label cdx-label"
                  title={
                    isUserEmailable
                      ? ""
                      : "No email associated with this user account or the user has disabled email access."
                  }
                >
                  <label
                    for="checkbox-description-css-only-1"
                    class="cdx-label__label"
                  >
                    Notify updates via e-mail
                  </label>
                </div>
              </span>

              {isEmailNotification && (
                <span id="cdx-description-css-1" class="cdx-label__description">
                  <p>
                    <span class="cdx-css-icon--info-filled"></span>
                    &nbsp; BUB2 will send an email to your email ID associated
                    with your Wikimedia account regarding the success or failure
                    of the upload.
                  </p>
                </span>
              )}
            </div>

            {isDuplicate ? (
              <ChangeIdentifier
                description={
                  <>
                    A file with this identifier{" "}
                    <a href={`https://archive.org/details/${IATitle}`}>
                      (https://archive.org/{IATitle})
                    </a>{" "}
                    already exists at Internet Archive. Please enter a different
                    identifier to proceed.
                  </>
                }
                inputPlaceholder="Enter unique file identifier"
                onIdentifierChange={(event) =>
                  setIAIdentifier(event.target.value)
                }
              />
            ) : null}

            {isInValidIdentifier === true ? (
              <ChangeIdentifier
                description={
                  <>
                    The file you want to upload with title - {IATitle} either
                    contains special characters or exceeds 50 characters in
                    length. Please provide an identifier that consists only of
                    letters (A-Z) and numbers (0-9).
                  </>
                }
                inputPlaceholder="Enter valid identifier"
                onIdentifierChange={(event) =>
                  setIAIdentifier(event.target.value)
                }
              />
            ) : null}

            {session && (
              <div>
                <div
                  style={{
                    marginTop: 20,
                    marginRight: 20,
                  }}
                >
                  <button
                    disabled={
                      isCommonsMetadataReady &&
                      !isDuplicate &&
                      !isInValidIdentifier
                        ? true
                        : false
                    }
                    className="cdx-button cdx-button--action-progressive cdx-button--weight-primary"
                  >
                    Upload Book
                  </button>
                  {isDuplicate === true || isInValidIdentifier === true ? (
                    <button
                      onClick={onResetButtonClicked}
                      style={{
                        marginLeft: 40,
                        marginBottom: hasCommonsMetadataUpdated
                          ? "0px"
                          : "100px",
                      }}
                      className="cdx-button cdx-button--action-progressive cdx-button--weight-primary"
                    >
                      Reset
                    </button>
                  ) : null}
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
          {loader && (!isCommonsMetadataReady || hasCommonsMetadataUpdated) ? (
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
        </Box>

        {isCommonsMetadataReady && (
          <Box
            sx={{
              width: "540px !important",
              marginBottom: "50px",
              "@media (max-width: 600px)": {
                width: "100% !important",
                paddingX: "0 !important",
              },
            }}
            className="main-content"
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setHasCommonsMetadataUpdated(true);
              }}
            >
              <textarea
                style={{ fontFamily: "Space Mono" }}
                disabled={hasCommonsMetadataUpdated ? true : false}
                className="cdx-text-input__input"
                id="commonsMetadata"
                name="commonsMetadata"
                value={commonsMetadata}
                onChange={(event) => setCommonsMetadata(event.target.value)}
                required
              />
              <style jsx>{`
                .cdx-text-input__input {
                  width: 100%;
                  min-height: 450px;
                  font-size: 13px;
                  line-height: 2.5;
                  letter-spacing: 2px;
                }
                @media (max-width: 600px) {
                  .cdx-text-input__input {
                    min-height: 350px;
                  }
                }
              `}</style>
              <button
                style={{
                  marginTop: 20,
                }}
                disabled={hasCommonsMetadataUpdated ? true : false}
                className="cdx-button cdx-button--action-progressive cdx-button--weight-primary"
              >
                Start Upload
              </button>
            </form>
          </Box>
        )}
      </BooksWrapper>
    </React.Fragment>
  );
};

export default Books;
