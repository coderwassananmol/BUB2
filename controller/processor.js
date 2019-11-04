module.exports = function(job){
    // Do some heavy work
    console.log(job);
    return Promise.resolve("abc");
  }