const mongoose = require("mongoose");

const TodoModel = mongoose.model("Todo", {
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
    TodoModel
}