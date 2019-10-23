module.exports = {
    checkForPublicDomain: (data, res) => {
        if (data.error) {
            if (data.error.code === 503) {
                //Google Books error
                res.send({ error: true, message: response.error.message });
                return {
                    error: true
                }
            }
        }
        else {
            const { publicDomain } = data.accessInfo; //Response object destructuring
            if (publicDomain === false) {
                //Checking if the book belongs to publicDomain
                res.send({ error: true, message: "Not in public domain." });
                return {
                    error: true
                }
            } else {
                res.send({
                    error: false,
                    message: "In public domain.",
                    data: data,
                    url: data.accessInfo.pdf.downloadLink,
                    title: data.volumeInfo.title
                });
                return {
                    error: false,
                    data
                }
            }
        }
    }
}
