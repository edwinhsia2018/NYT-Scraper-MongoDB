var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var articleSchema = new Schema({
    title: {
        type: String,
        trim: true
    },
    summary: {
        type: String,
        trim: true
    },
    link: {
        type: String,
        trim: true
    },
    img: {
        type: String,
        trim: true
    },
    saved: {
        type: Boolean,
        default: false
    },
    notes: {
        type: Schema.Types.ObjectId,
        ref: "Note"
    }
});

var Article = mongoose.model("Article", articleSchema);

module.exports = Article;