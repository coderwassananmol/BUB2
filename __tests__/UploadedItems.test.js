import React from "react";
import { render, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import UploadedItems from "../components/UploadedItems";

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () =>
      Promise.resolve({
        response: {
          numFound: 42,
        },
      }),
  })
);

describe("UploadedItems Component", () => {
  it("fetches and displays the number of books uploaded", async () => {
    const { getByText } = render(<UploadedItems />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(
        getByText("42 books uploaded to Internet Archive using BUB2!")
      ).toBeInTheDocument();
    });
  });
});
