import React from "react";
import { render, screen } from "@testing-library/react";
import QueueSection from "../components/QueueSection";

describe("QueueSection Component", () => {
  it("should render the current active job", () => {
    const activeJob = "Active Job Title";
    render(<QueueSection active={activeJob} />);
    const activeJobTitle = screen.getByText("Current active");
    const activeJobDescription = screen.getByText(activeJob);
    expect(activeJobTitle).toBeInTheDocument();
    expect(activeJobDescription).toBeInTheDocument();
  });

  it("should render 'No active job' when no active job provided", () => {
    render(<QueueSection active={null} />);
    const activeJobTitle = screen.getByText("Current active");
    const noActiveJobMessage = screen.getByText("No active job");
    expect(activeJobTitle).toBeInTheDocument();
    expect(noActiveJobMessage).toBeInTheDocument();
  });

  it("should render the next job", () => {
    const nextJob = "Next Job Title";
    render(<QueueSection waiting={nextJob} />);
    const nextJobTitle = screen.getByText("Next job");
    const nextJobDescription = screen.getByText(nextJob);
    expect(nextJobTitle).toBeInTheDocument();
    expect(nextJobDescription).toBeInTheDocument();
  });

  it("should render 'No waiting job' when no next job provided", () => {
    render(<QueueSection waiting={null} />);
    const nextJobTitle = screen.getByText("Next job");
    const noWaitingJobMessage = screen.getByText("No waiting job");
    expect(nextJobTitle).toBeInTheDocument();
    expect(noWaitingJobMessage).toBeInTheDocument();
  });
});
