const express = require("express");
const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.json());

const { mongoose } = require("./db/mongoose");
const { Todo } = require("./models/todoModel");
const { User } = require("./models/userModel");


app.get("/", (req,res) => {
    res.send("Hello");
});

app.post("/todos", (req,res) => {
    // res.send(req.body);
    const todo = new Todo({
        text: req.body.text
    });
    todo.save()
        .then(doc => {
            res.send("Document added"); 
        })
        .catch(err => {
            res.status(400).send(err)
        });
});

app.listen(3000,() => {
    console.log("Server is running ...");
});
