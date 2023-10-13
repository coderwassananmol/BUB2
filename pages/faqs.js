import Header from "../components/Header";
import FaqsSection from "../components/FaqsSection";
import { faq_data } from "../utils/constants";

const Faqs = () => {
  return (
    <div>
      <style jsx>
        {`
          .faq-container {
            color: #36c;
            flex-grow: 0;
          }
        `}
      </style>
      <Header page="faqs" />
      <div>
        <div className="container p-0">
          <div className="main-content">
            <h4>Frequently Asked Questions</h4>
            <div className="faq-container">
              <FaqsSection faqs_data={faq_data} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Faqs;
