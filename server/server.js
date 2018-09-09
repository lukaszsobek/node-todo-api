const express = require("express");
const bodyParser = require("body-parser");
const { ObjectID } = require("mongodb");
const _ = require("lodash");
const { authenticateUser } = require("./middleware/authenticateUser");

const app = express();

app.use(bodyParser.json());

require("./config/config");
require("./db/mongoose");

const { Todo } = require("./models/todoModel");
const { User } = require("./models/userModel");

app.get("/", (req,res) => {
    res.send("Hello, welcome to the Todo api");
});

app.get("/todos", authenticateUser, (req,res) => {
     Todo.find({
        _creatorId: req.user._id
    })
        .then(todos => {
            res.send({
                data: todos,
                error: null
            });
        })
        .catch(err => {
            res.status(400).send({
                data: {},
                error: err
            });   
        });
    
});

app.post("/todos", authenticateUser, (req,res) => {
    const todo = new Todo({
        text: req.body.text,
        _creatorId: req.user._id
    });
    todo.save()
        .then(doc => {
            res.send({
                data: doc,
                error: null
            }); 
        })
        .catch(err => {
            res.status(400).send({
                data: {},
                error: err
            });
        });
});

app.delete("/todos/:id", authenticateUser, (req, res) => {
    const todoID = req.params.id || "";

    if(!ObjectID.isValid(todoID)) {
        return res.status(404).send({
            data: {},
            error: "Todo not found"
        });
    }

    Todo.findOneAndRemove({
        _id: new ObjectID(todoID),
        _creatorId: req.user._id
    })
        .then(todo => {

            if (!todo) {
                return res.status(404).send({
                    data: {},
                    error: "Todo not found"
                });
            }

            res.send({
                data: todo,
                error: null
            });

        }).catch(err => res.status(404).send({
            data: {},
            error: err
        }))
});

app.patch("/todos/:id", authenticateUser, (req, res) => {
    const todoID = req.params.id || "";
    if(!ObjectID.isValid(todoID)) {
        return res.status(404).send();
    }

    const changes = _.pick(req.body, ["text", "isCompleted"]);
    const updatedTodo = {
        isCompleted: !!changes.isCompleted
    }
    if(changes.text) {
        updatedTodo.text = changes.text
    }
    updatedTodo.completedDate = updatedTodo.isCompleted
        ? Date.now()
        : 0;
    
    Todo.findOneAndUpdate({
        _id: new ObjectID(todoID),
        _creatorId: req.user._id
    }, {$set: updatedTodo}, {new: true})
        .then(todo => {
            if(!todo) {
                return res.status(404).send({
                    data: {},
                    error: "Todo not found"
                });
            }  

            res.send({
                data: todo,
                error: null
            });

        }).catch(err => res.status(400).send({
            data: {},
            error: err
        }));
});

app.get("/todos/:id", (req, res) => {
    const todoID = req.params.id || "";
    if(!ObjectID.isValid(todoID)) {
        return res.status(404).send();
    }
    Todo.findById(todoID).then(todo => {
        if(!todo) {
            return res.status(404).send({
                data: {},
                error: "Todo not found"
            });
        }
        res.send({ 
            data: todo,
            error: null
        });
    }).catch(e => res.send({
        data: {},
        error: e
    }));
});


app.post("/users",(req,res) => {

    const user = new User({
        email: req.body.email,
        password: req.body.password
    });
    user.save()
        .then(() => {
            return user.generateAuthToken()
        })
        .then(token => res.header("x-auth",token).send({ data: user, error: null }))
        .catch(err => res.status(400).send({ data: {}, error: err }));
});

app.post("/users/login", (req,res) => {
    const { email, password } = req.body;
    User.findByCredentials(email, password)
        .then(user => {
            user.generateAuthToken()
             .then(token => res.header("x-auth",token).send({ data: user, error: null }))
        })
        .catch(() => res.status(400).send({ data: {}, error: "No such user" })); 
});

app.get("/users/me", authenticateUser, (req,res) => {
    res.send({ data: req.user, error: null });
});

app.delete("/users/me/token", authenticateUser, (req, res) => {
    req.user
        .removeToken(req.token)
        .then(() => res.send({ data: {}, error: null }))
        .catch(err => res.status(400).send({ data: {}, error: err }))
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}...`);
});

module.exports = { app }
