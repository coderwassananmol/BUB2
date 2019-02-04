var mongoosePaginate = require('mongoose-paginate');

mongoosePaginate.paginate.options = { 
    lean:  true,
    limit: 20
};