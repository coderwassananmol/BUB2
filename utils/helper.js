/* Helper functions to modularize the code */
const fetch = require("isomorphic-fetch");
module.exports = {
    checkForDuplicatesFromIA: async (ID) => {
        return fetch(`https://archive.org/advancedsearch.php?q=${ID}&fl[]=identifier&output=json`)
        .then(res => res.json(),err => console.log(err))
        .catch(err => console.log(err))
    },
    
    customFetch: async (URI,method="GET",headers=new Headers()) => {
        return fetch(URI,{
            method: method,
            headers: headers
        }).then(res => res.json(), err => console.log(err)).catch(err => console.log(err))
    },

    queueData: async (job,queue) => {
        if(job.length === 0)
            return null
        const jobid = job[0].id;
        const {logs} = await queue.getJobLogs(jobid,0);
        return JSON.parse(logs[0]);
    }
}