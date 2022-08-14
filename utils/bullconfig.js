const Queue = require('bull');
require("dotenv").config();
module.exports = {
    getNewQueue: (name) => {
        return new Queue(name,{
            redis: {
                port: process.env.redisport,
                host: process.env.redishost
            }
        })
    }
}