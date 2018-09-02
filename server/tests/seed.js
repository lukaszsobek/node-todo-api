const { ObjectID } = require("mongodb");
const jwt = require("jsonwebtoken");

const { Todo } = require("../models/todoModel");
const { User, salt } = require("../models/userModel");

const sampleTodos = [
    { _id: new ObjectID() , text: "Sample 1", isCompleted: false },
    { _id: new ObjectID(), text: "Sample 2", isCompleted: true, completedDate: 123456  }
];

const seedTodoCollection = done => {
    Todo.deleteMany()
        .then(() => Todo.insertMany(sampleTodos))
        .then(() => done());
};

const sampleUser1ID = new ObjectID();
const sampleUser1Token = jwt.sign({
    _id: sampleUser1ID,
    access: "auth"
}, salt).toString();

const sampleUsers = [{
        _id: sampleUser1ID,
        email: "a@a.com",
        password: "sampleUser1",
        tokens: [{
            access: "auth",
            token: sampleUser1Token
        }]
    },{
        _id: new ObjectID(),
        email: "b@b.com",
        password: "sampleUser2"
}];

const seedUserCollection = done => {
    User.deleteMany()
        .then(() => {
            const userOne = new User(sampleUsers[0]).save();
            const userTwo = new User(sampleUsers[1]).save();
            return Promise.all([ userOne, userTwo ]);
        })
        .then(() => done());
}

module.exports = {
    sampleTodos, seedTodoCollection,
    sampleUsers, seedUserCollection
}