const { ObjectID } = require("mongodb");
const jwt = require("jsonwebtoken");

const { Todo } = require("../models/todoModel");
const { User } = require("../models/userModel");

const sampleUser1ID = new ObjectID();
const sampleUser1Token = jwt.sign({
    _id: sampleUser1ID,
    access: "auth"
}, process.env.JWT_SECRET).toString();
const sampleUser2ID = new ObjectID();

const sampleUsers = [{
        _id: sampleUser1ID,
        email: "a@a.com",
        password: "sampleUser1",
        tokens: [{
            access: "auth",
            token: sampleUser1Token
        }]
    },{
        _id: sampleUser2ID,
        email: "b@b.com",
        password: "sampleUser2"
}];

const sampleTodos = [
    {
        _id: new ObjectID(),
        text: "Sample 1",
        isCompleted: false,
        _creatorId: sampleUser1ID
    },
    {
        _id: new ObjectID(),
        text: "Sample 2",
        isCompleted: true,
        completedDate: 123456,
        _creatorId: sampleUser2ID
    }
];

const seedTodoCollection = done => {
    Todo.deleteMany()
        .then(() => Todo.insertMany(sampleTodos))
        .then(() => done());
};

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