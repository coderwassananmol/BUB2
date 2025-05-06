import React from "react";
import { render } from "@testing-library/react";
import Question from "../components/Question";
import "@testing-library/jest-dom";

describe("Question component", () => {
  it("should render the text correctly", () => {
    const text = "This is the Question text";
    const { getByText } = render(<Question text={text} />);
    const QuestionElement = getByText(text);
    expect(QuestionElement).toBeInTheDocument();
  });
});
