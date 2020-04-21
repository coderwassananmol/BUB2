import React, { Component } from "react";
import { render } from "react-dom";

export default class Faq extends Component {
  render() {
    return (
      <div className="faq">
        <style jsx>
          {`
            .faq {
              display: flex;
              justify-content: center;
              flex-direction: column;
              height: 100%;
              background-color: #3ec6ff;
              font-family: "arial";
            }
            .heading {
              display: flex;
              justify-content: center;
              align-items: center;
              flex-direction: column;
              height: 100%;
              font-size: 2rem;
              color: black;
              font-weight: 600;
            }
            .question {
              display: flex;
              justify-content: center;
              align-items: left;
              flex-direction: column;
              height: 100%;
              font-size: 1.8rem;
              color: black;
              font-weight: 600;
              padding-left: 50px;
            }
            .answer {
              display: flex;
              justify-content: center;
              align-items: left;
              flex-direction: column;
              height: 100%;
              font-size: 1.4rem;
              color: white;
              font-weight: 400;
              padding-left: 100px;
            }
          `}
        </style>
        <p className="heading">FREQUENTLY ASKED QUESTIONS</p>
        <p className="question">- What is Book Uploader Bot?</p>
        <p className="answer">
          A Book Uploader Bot transfers documents from public libraries such as
          Google Books, and Punjab Digital Library etc to Internet Archive.
        </p>
        <p className="question">- What does this tool do?</p>
        <p className="answer">
          The tool is built to help the community with free books that are
          available in the online public libraries. It makes the integration of
          books easier.
        </p>
        <p className="question">- Who can benefit from this tool?</p>
        <p className="answer">
          The tool, under the hood, compiles all the book images/pdf and its
          meta data at one place where it can be accessed by anyone in the
          world.
        </p>
        <p className="question">- What are the future enhancements?</p>
        <p className="answer">
          Bulk upload future, MediaWiki OAuth integration, Direct uploading to
          Commons
        </p>
        <p className="question">- Can I upload my own book?</p>
        <p className="answer">
          If an appropriate license is attached to the book which allows it to
          be archived(which doesn't allow copyright infringement suits, etc.),
          then book can be uploaded.
        </p>
        <p className="question">- Can I delete or undo an upload?</p>
        <p className="answer">
          Archives are supposed to be read-only, and deleting is a 'write'
          operation. So it does not support.
        </p>
      </div>
    );
  }
}
