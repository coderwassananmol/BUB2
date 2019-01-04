var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');

var Schema = mongoose.Schema;

var BookSchema = new Schema(
  {
    bookid: {type: String, required: true},
    publisher: {type: String, required: false},
    publishedDate: {type: String, required: false},
    imageLinks: {type: String, required: false},
    previewLink: {type: String, required: false},
    downloadLink: {type: String, required: false},
    title: {type: String, required: true},
    isbn: {type: String, required: false},
    uri: {type: String, required: true},
    status: {type: Boolean, required: true}
  }
);

BookSchema.plugin(mongoosePaginate);

// Virtual for book's URL
BookSchema
.virtual('url')
.get(function () {
  return '/catalog/book/' + this._id;
});

//Export model
module.exports = mongoose.model('Book', BookSchema);