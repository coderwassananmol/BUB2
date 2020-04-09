import React from "react";
export default class Faq extends React.Component {
  render() {
    return (
      <div>
        <p>Frequently Asked Questions</p>
        <p>What is Book Uploader Bot?</p>A Book Uploader Bot transfers documents
        from public libraries such as Google Books, and Punjab Digital Library
        etc to Internet Archive.
        <p>What does this tool do?</p>
        The tool is built to help the community with free books that are
        available in the online public libraries. It makes the integration of
        books easier.
        <p>Who can benefit from this tool?</p>
        The tool, under the hood, compiles all the book images/pdf and its meta
        data at one place where it can be accessed by anyone in the world.
        <p>What are the future enhancements?</p>
        Bulk upload future, MediaWiki OAuth integration, Direct uploading to
        Commons
        <p>Can I upload my own book?</p>
        If an appropriate license is attached to the book which allows it to be
        archived(which doesn't allow copyright infringement suits, etc.), then
        book can be uploaded.
        <p>Can I delete or undo an upload?</p>
        Archives are supposed to be read-only, and deleting is a 'write'
        operation. So it does not support.
      </div>
    );
  }
}
