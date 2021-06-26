/* Helper functions to modularize the code */
const fetch = require("isomorphic-fetch");
module.exports = {
  checkForDuplicatesFromIA: async (ID) => {
    return fetch(
      `https://archive.org/advancedsearch.php?q=${ID}&fl[]=identifier&output=json`
    )
      .then(
        (res) => res.json(),
        (err) => console.log(err)
      )
      .catch((err) => console.log(err));
  },

  customFetch: async (URI, method = "GET", headers = new Headers()) => {
    return fetch(URI, {
      method: method,
      headers: headers,
    })
      .then(
        (res) => res.json(),
        (err) => console.log(err)
      )
      .catch((err) => console.log(err));
  },

  queueData: async (job, queue) => {
    if (!job) return null;
    const jobid = job.id;
    const { logs } = await queue.getJobLogs(jobid, 0);
    if (logs[0]) return JSON.parse(logs[0]);
    else return [];
  },

  statusConfig: (processedOn, sum) => {
    return {
      [sum]: "Completed",
      [processedOn]: "Active",
      0: "In Queue",
    };
  },

  bookTitle: {
    gb: "volumeInfo.title",
    pdl: "title",
  },

  getPreviewLink: (queue_name, book_id, category_id = null) => {
    const previewLinks = {
      gb: `http://books.google.co.in/books?id=${book_id}&hl=&source=gbs_api`,
      pdl: `http://www.panjabdigilib.org/webuser/searches/displayPage.jsp?ID=${book_id}&page=1&CategoryID=${category_id}&Searched=W3GX`,
    };
    return previewLinks[queue_name];
  },
};
