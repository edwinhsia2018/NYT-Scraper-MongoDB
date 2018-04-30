var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var noteSchema = new Schema ({
    title: {
        type: String,
        trim: true
    },
    body: {
        type: String,
        trim: true
    }
});

var Note = mongoose.model("Note", noteSchema);

module.exports = Note;