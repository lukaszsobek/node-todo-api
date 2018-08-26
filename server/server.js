const express = require("express");
const bodyParser = require("body-parser");
const { ObjectID } = require("mongodb");
const _ = require("lodash");

const app = express();

app.use(bodyParser.json());

require("./config/config");
require("./db/mongoose");

const { Todo } = require("./models/todoModel");
const { User } = require("./models/userModel");


app.get("/", (req,res) => {
    res.send("Hello, welcome to the Todo api");
});

app.get("/todos", (req,res) => {
    Todo.find()
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

app.post("/todos", (req,res) => {
    const todo = new Todo({
        text: req.body.text
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

app.delete("/todos/:id", (req, res) => {
    const todoID = req.params.id || "";

    if(!ObjectID.isValid(todoID)) {
        return res.status(404).send({
            data: {},
            error: "Todo not found"
        });
    }

    Todo.findByIdAndRemove(todoID)
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

app.patch("/todos/:id", (req, res) => {
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
    
    Todo.findByIdAndUpdate(todoID, {$set: updatedTodo}, {new: true})
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
})

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}...`);
});

module.exports = { app }
