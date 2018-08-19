const expect = require("expect");
const request = require("supertest");

const { app } = require("../server");
const { Todo } = require("../models/todoModel");

const sampleTodos = [
    { text: "Sample 1" },
    { text: "Sample 2" }
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
