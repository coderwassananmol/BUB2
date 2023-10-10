export const host =
  process.env.NODE_ENV === "production"
    ? "https://bub2.toolforge.org"
    : "http://localhost:5000"; //If you have port set in env file, replace 5000 with "process.env.PORT"
export const stats_data_endpoint = `${host}/getstats`;
export const queue_data_endpoint = `${host}/getqueue`;
export const queuelist_data_endpoint = `${host}/getqueuelist`;
export const library = {
  gb: "Google Books",
  pdl: "Panjab Digital Library",
  trove: "Trove Digital Library",
};
export const faq_data = [
  {
    que: "What is Book Uploader Bot?",
    ans:
      "A Book Uploader Bot transfers documents from public libraries such as Google Books, and Punjab Digital Library etc to Internet Archive.",
  },
  {
    que: "What does this tool do?",
    ans:
      "The tool is built to help the community with free books that are available in the online public libraries. It makes the integration of books easier.",
  },
  {
    que: "Who can benefit from this tool?",
    ans:
      "The tool, under the hood, compiles all the book images/pdf and its meta data at one place where it can be accessed by anyone in the world.",
  },
  {
    que: "What are the future enhancements?",
    ans:
      "Bulk upload feature, direct upload to Wikimedia Commons and addition of newer libraries are some features being actively worked upon.",
  },
  {
    que: "Can I upload my own book?",
    ans:
      "If an appropriate license is attached to the book which allows it to be archived (which doesn't allow copyright infringement suits, etc.), then book can be uploaded.",
  },
  {
    que: "Can I delete or undo an upload?",
    ans:
      "Archives are supposed to be read-only and deleting is a 'write' operation. So it is not supported.",
  },
];
export const header_links = [
  { name: "Upload", href: "/", id: "form-tabs-1" },
  { name: "Queue", href: "/queue", id: "form-tabs-2" },
  { name: "Stats", href: "/stats", id: "form-tabs-3" },
  { name: "FAQs", href: "/faqs", id: "form-tabs-4" },
];
