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
    },
    _creatorId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
})

TodoSchema.methods.toJSON = function() {
    const todo = this;
    const { text, isCompleted, completedDate } = todo.toObject();
    return { text, isCompleted, completedDate };
}

const Todo = mongoose.model("Todo", TodoSchema);

module.exports = { Todo }