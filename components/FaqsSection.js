import React from "react";

const FaqsSection = ({ faqs_data }) => {
  return (
    <div>
      <style jsx>
        {`
          .cdx-card-custom {
            margin-top: 20px;
            flex: 20%;
            margin-right: 20px;
            max-width: 400px;
          }
          .queue-section {
            display: flex;
            flex-direction: row;
          }
        `}
      </style>
      {faqs_data?.map((faq, index) => (
        <span key={index} className="cdx-card cdx-card-custom">
          <span className="cdx-card__text">
            <span className="cdx-card__text__title">{faq?.que}</span>
            <span className="cdx-card__text__description">{faq?.ans}</span>
          </span>
        </span>
      ))}
    </div>
  );
};

export default FaqsSection;
