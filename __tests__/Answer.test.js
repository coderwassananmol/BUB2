import React from "react";
import { render } from "@testing-library/react";
import Answer from "../components/Answer";
import "@testing-library/jest-dom";

describe("Answer component", () => {
  it("should render the text correctly", () => {
    const text = "This is the answer text";
    const { getByText } = render(<Answer text={text} />);
    const answerElement = getByText(text);
    expect(answerElement).toBeInTheDocument();
  });
});
