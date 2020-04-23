import React, { Component } from "react";
import { render } from "react-dom";
import { faq_data } from "../utils/constants.js";

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
              background-color: #3ec6ff;
              font-family: "arial";
              padding-bottom: 50px;
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
              padding-top: 50px;
            }
            .question {
              display: flex;
              justify-content: center;
              align-items: left;
              flex-direction: column;
              height: 100%;
              font-size: 1.6rem;
              color: black;
              font-weight: 500;
              padding-left: 50px;
            }
            .answer {
              display: flex;
              justify-content: center;
              align-items: left;
              flex-direction: column;
              height: 100%;
              font-size: 1.2rem;
              color: white;
              font-weight: 400;
              padding-left: 100px;
            }
          `}
        </style>
        <p className="heading">FREQUENTLY ASKED QUESTIONS</p>
        <div className="data-1">
          <p className="question">{faq_data[0].que}</p>
          <p className="answer">{faq_data[0].ans}</p>
        </div>
        <div className="data-2">
          <p className="question">{faq_data[1].que}</p>
          <p className="answer">{faq_data[1].ans}</p>
        </div>
        <div className="data-3">
          <p className="question">{faq_data[2].que}</p>
          <p className="answer">{faq_data[2].ans}</p>
        </div>
        <div className="data-4">
          <p className="question">{faq_data[3].que}</p>
          <p className="answer">{faq_data[3].ans}</p>
        </div>
        <div className="data-5">
          <p className="question">{faq_data[4].que}</p>
          <p className="answer">{faq_data[4].ans}</p>
        </div>
        <div className="data-6">
          <p className="question">{faq_data[5].que}</p>
          <p className="answer">{faq_data[5].ans}</p>
        </div>
      </div>
    );
  }
}
