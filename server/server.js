const express = require("express");
const bodyParser = require("body-parser");
const { ObjectID } = require("mongodb");
const app = express();

app.use(bodyParser.json());

require("./db/mongoose");

const { Todo } = require("./models/todoModel");
const { User } = require("./models/userModel");


app.get("/", (req,res) => {
    res.send("Hello");
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
    // res.send(req.body);
    const todo = new Todo({
        text: req.body.text
    });
    todo.save()
        .then(doc => {
            res.send(doc); 
        })
        .catch(err => {
            res.status(400).send(err)
        });
});

app.get("/todos/:id", (req, res) => {
    const todoID = req.params.id || "";
    if(!ObjectID.isValid(todoID)) {
        return res.status(404).send();
    }
    Todo.findById(todoID).then(todo => {
        if(!todo) {
            return res.status(404).send();
        }
        res.send({todo})
    }).catch(e => console.log(e));
})

app.listen(3000,() => {
    console.log("Server is running ...");
});

module.exports = {
    app
}
