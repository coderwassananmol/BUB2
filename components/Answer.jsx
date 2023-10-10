import React from "react";
import Link from "next/link";

const Answer = ({ text }) => (
  <div>
    <style jsx>
      {`
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
    <p className="answer">{text}</p>
  </div>
);

export default Answer;
