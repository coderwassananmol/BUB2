import React from "react";
import { render } from "@testing-library/react";
import ShowQueue from "../components/ShowQueue";
import "@testing-library/jest-dom";

describe("ShowQueue Component", () => {
  it("renders the component with library name and queue data", () => {
    const data = {
      waiting: 10,
      active: 5,
      completed: 20,
      failed: 3,
      delayed: 2,
    };
    const library = "Sample Library";

    const { getByText } = render(<ShowQueue data={data} library={library} />);
    expect(getByText("Sample Library")).toBeInTheDocument();
    expect(getByText("Waiting: 10")).toBeInTheDocument();
    expect(getByText("Active: 5")).toBeInTheDocument();
    expect(getByText("Completed: 20")).toBeInTheDocument();
    expect(getByText("Failed: 3")).toBeInTheDocument();
    expect(getByText("Delayed: 2")).toBeInTheDocument();
  });

  it("renders the component with no data", () => {
    const { getByText } = render(<ShowQueue data={{}} library="No Data" />);
    expect(getByText("No Data")).toBeInTheDocument();
    expect(getByText("Waiting:")).toBeInTheDocument();
    expect(getByText("Active:")).toBeInTheDocument();
    expect(getByText("Completed:")).toBeInTheDocument();
    expect(getByText("Failed:")).toBeInTheDocument();
    expect(getByText("Delayed:")).toBeInTheDocument();
  });
});
