import React, { Component } from "react";
import { render } from "react-dom";
import { faq_data } from "../utils/constants.js";
import Question from "../components/Question";
import Answer from "../components/Answer";

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
            }
          `}
        </style>
        <div className="faq">
          <p className="heading">FREQUENTLY ASKED QUESTIONS</p>
          <div className="data-1">
            {faq_data.map(function (item, index) {
              return (
                <div key={index}>
                  <Question text={item.que} />
                  <Answer text={item.ans} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}
