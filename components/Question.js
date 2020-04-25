import React from "react";
import Link from "next/link";

const Question = ({ text }) => (
  <div>
    <style jsx>
      {`
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
      `}
    </style>
    <p className="question">{text}</p>
  </div>
);

export default Question;
