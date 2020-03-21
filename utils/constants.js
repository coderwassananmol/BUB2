const host = process.env.NODE_ENV === 'production' ? 'https://bub2.toolforge.org' : 'http://localhost:5000' //If you have port set in env file, replace 5000 with "process.env.PORT"
export const stats_data_endpoint = `${host}/getstats`
export const queue_data_endpoint = `${host}/getqueue`