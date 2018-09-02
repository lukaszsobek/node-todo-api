const { ObjectID } = require("mongodb");
const { Todo } = require("../models/todoModel");

const sampleTodos = [
    { _id: new ObjectID() , text: "Sample 1", isCompleted: false },
    { _id: new ObjectID(), text: "Sample 2", isCompleted: true, completedDate: 123456  }
];

const seedDatabase = done => {
    Todo.deleteMany()
        .then(() => Todo.insertMany(sampleTodos))
        .then(() => done());
};

module.exports = { sampleTodos, seedDatabase }