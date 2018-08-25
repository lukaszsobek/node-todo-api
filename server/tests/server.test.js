const expect = require("expect");
const request = require("supertest");
const { ObjectID } = require("mongodb");

const { app } = require("../server");
const { Todo } = require("../models/todoModel");

const sampleTodos = [
    { _id: new ObjectID() , text: "Sample 1" },
    { _id: new ObjectID(), text: "Sample 2" }
];

describe("Getting todos", () => {

    beforeEach(done => {
        Todo.deleteMany()
            .then(() => Todo.insertMany(sampleTodos))
            .then(() => done());
    });

    it("/todos route gets all todos", done => {
        request(app)
            .get("/todos")
            .expect(200)
            .expect(res => {
                expect(res.body.error).toBe(null);
                expect(res.body.data.length).toBe(2);
            })
            .end(done);
    });

    it("todos/:id gets a specific id",done => {
        const _id = sampleTodos[0]._id.toHexString();
        request(app)
            .get(`/todos/${_id}`)
            .expect(200)
            .expect(res => {
                // ↓ comparing ObjectId with a string for convenience sake
                expect(res.body.todo._id).toEqual(_id); 
                expect(res.body.todo.text).toBe(sampleTodos[0].text);
            })
            .end(done);
    });

    it("non-existant :id returns an error status", done => {
        const _id = new ObjectID().toHexString();      
        request(app)
            .get(`/todos/${_id}`)
            .expect(404)
            .end(done);
    });

    it("invalid :id returns an error status", done => {
        request(app)
            .get("/todos/sample")
            .expect(404)
            .end(done);
    });
});

describe("Posting todos", () => {

    it("invalid data doesn't create new todo",done => {
        let text = "    ";
        request(app)
            .post("/todos")
            .send({text})
            .expect(400)
            .end(done);
    });



    // xit("creates a new todo", done => {
    //     const text = "Testing the todo creation";
    //     request(app)
    //         .post("/todos")
    //         .send({text})
    //         .expect(200)
    //         .expect(res => {
    //             expect(res.body.text).toBe(text);
    //         })
    //         .end((err, res) => {
    //             if(err) {
    //                 return done(err);
    //             }

    //             Todo.findOneAndUpdate((todos) => {
    //                 expect(todos.length).toBe(1);
    //                 expect(todos[0].text).toBe(text);
    //                 done();
    //             }).catch(done);
    //         });
    // });
});
