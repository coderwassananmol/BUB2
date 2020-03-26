import React from "react";

export default function BUBInfo() {
  const styling = {
    outer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: 'column',
      padding: '7vw',
      minHeight: '70vh',
      height: "100%"
    },
    title: {
        fontSize: '5rem',
        color: 'white',
        fontWeight: '600'
    },
    subtitle: {
        fontSize: '1.8rem',
        color: 'white',
    }
  };
  return (
    <div style={styling.outer}>
      <div className="title" style={styling.title}>Book Uploader Bot (BUB) v2.0</div>
      <div className="sub-title" style={styling.subtitle}>
        A bot that helps you transfer books that belong to public domain to Internet Archive from
        libraries like Google Books, West Bengal State Library etc. Using IA Upload Tool, you can
        then transfer these books to Wikimedia Commons.
      </div>
    </div>
  );
}
