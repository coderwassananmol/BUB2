import React, { Component } from "react";
import { render } from "react-dom";

export default class Faq extends Component {
  constructor() {
    super();
    this.state = {
      que_ans: [
        "-What is Book Uploader Bot?",
        "A Book Uploader Bot transfers documents from public libraries such as Google Books and Punjab Digital Library etc to Internet Archive.",
        "-What does this tool do?",
        "The tool is built to help the community with free books that are available in the online public libraries. It makes the integration of books easier.",
        "- Who can benefit from this tool?",
        "The tool, under the hood, compiles all the book images/pdf and its meta data at one place where it can be accessed by anyone in the world.",
        "- What are the future enhancements?",
        "Bulk upload future, MediaWiki OAuth integration, Direct uploading to Commons",
        "- Can I upload my own book?",
        "If an appropriate license is attached to the book which allows it to be archived(which does not allow copyright infringement suits, etc.),then book can be uploaded.",
        "- Can I delete or undo an upload?",
        "Archives are supposed to be read-only, and deleting is a 'write' operation. So it does not support.",
      ],
    };
  }
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
            .que_ans {
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
        <div className="que_ans">
          {this.state.que_ans.map((value, index) => (
            <p>{value}</p>
          ))}
        </div>
      </div>
    );
  }
}
