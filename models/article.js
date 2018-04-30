var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var articleSchema = new Schema({
    headline: {
        type: String,
        trim: true
    },
    summary: {
        type: String,
        trim: true
    },
    url: {
        type: String,
        trim: true
    },
    photourl: {
        type: String,
        trim: true
    },
    notes: {
        type: Schema.Types.ObjectId,
        ref: "Note"
    }
});

var Article = mongoose.model("Article", articleSchema);

module.exports = Article;