const mongoose = require("mongoose");

const Todo = mongoose.model("Todo", {
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
});

module.exports = {
    Todo
}