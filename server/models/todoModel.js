const mongoose = require("mongoose");

const TodoSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
        trim: true,
        minlength: 1
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    completedDate: {
        type: Number,
        default: 0
    }
})

const Todo = mongoose.model("Todo", TodoSchema);

module.exports = { Todo }