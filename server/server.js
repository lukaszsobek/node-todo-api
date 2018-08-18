const express = require("express");
const bodyParser = require("body-parser");
const app = express();

const { mongoose } = require("./db/mongoose");
const { Todo } = require("./models/todoModel");
const { User } = require("./models/userModel");


app.get("/", (req,res) => {
    res.send("Hello");
});

app.listen(3000,() => {
    console.log("Server is running ...");
});
