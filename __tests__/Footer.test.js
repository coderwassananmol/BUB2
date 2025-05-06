import React from "react";
import { render, screen } from "@testing-library/react";
import Footer from "../components/Footer";
import "@testing-library/jest-dom";

describe("Footer Component", () => {
  it("should render the footer text", () => {
    render(<Footer />);
    const footerText = screen.getByText((content, element) => {
      return content.startsWith("Made with");
    });
    expect(footerText).toBeInTheDocument();
  });
});
