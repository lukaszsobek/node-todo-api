const expect = require("expect");
const request = require("supertest");
const { ObjectID } = require("mongodb");

const { app } = require("../server");
const { Todo } = require("../models/todoModel");
const { User } = require("../models/userModel");

const {
    sampleTodos, seedTodoCollection,
    sampleUsers, seedUserCollection
} = require("./seed");

beforeEach(seedUserCollection);
beforeEach(seedTodoCollection);

describe("Getting todos", () => {

    it("is not possible without logging in", done => {
        request(app)
            .get("/todos")
            .expect(401)
            .expect(res => {
                expect(res.body.error).not.toBe(null);
            })
            .end(done);
    });

    it("/todos route gets all todos", done => {
        request(app)
            .get("/todos")
            .set("x-auth", sampleUsers[0].tokens[0].token)
            .expect(200)
            .expect(res => {
                expect(res.body.error).toBe(null);
                expect(res.body.data.length).toBe(1);
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
                expect(res.body.data._id).toBe(_id); 
                expect(res.body.data.text).toBe(sampleTodos[0].text);
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

describe("Deleting todos", () => {
    const token = sampleUsers[0].tokens[0].token;

    it("is not possible without logging in", done => {
        const id = new ObjectID().toHexString();
        request(app)
            .delete(`/todos/${id}`)
            .expect(401)
            .expect(res => {
                expect(res.body.error).not.toBe(null)
            })
            .end(done);
    });

    it("throws error on invalid id", done => {
        const id = "test";
        request(app)
            .delete(`/todos/${id}`)
            .set("x-auth", token)
            .expect(404)
            .expect(res => {
                expect(res.body.error).not.toBe(null);
            })
            .end(done);
    });

    it("throws error on non-existing id", done => {
        const id = new ObjectID().toHexString();

        request(app)
            .delete(`/todos/${id}`)
            .set("x-auth", token)
            .expect(404)
            .end(done);
    });

    it("cannot delete note of other user", done => {
        const noteId = sampleTodos[1]._id;
        request(app)
            .delete(`/todos/${noteId}`)
            .set("x-auth", token)
            .expect(404)
            .end(done);
    });

    it("deletes existing note", done => {
        const id = sampleTodos[0]._id.toHexString();
        request(app)
            .delete(`/todos/${id}`)
            .set("x-auth", token)
            .expect(200)
            .expect(res => {
                expect(res.body.data._id).toBe(id);
                expect(res.body.data.text).toBe(sampleTodos[0].text);
            })
            .end((err) => {
                if(err) {
                    return done(err);
                }

                Todo.findById(id)
                    .then(item => {
                        if(!item) {
                            return done();
                        }
                    }).catch(err => done(err));
            });
    });
});

describe("Patching a todo", () => {
    it("Throws error on invalid id", done => {
        const id = "test";
        
        request(app)
            .delete(`/todos/${id}`)
            .expect(404)
            .end(done);
    });

    it("Throws error on non-existing id", done => {
        const id = new ObjectID().toHexString();

        request(app)
            .delete(`/todos/${id}`)
            .expect(404)
            .end(done);
    });

    it("Patches existing note", done => {
        const id = sampleTodos[0]._id.toHexString();
        const isCompleted = true;
        const text = "New text from test"
        request(app)
            .patch(`/todos/${id}`)
            .send({ isCompleted, text })
            .expect(200)
            .expect(({ body }) => {
                expect(body.data.isCompleted).toBe(isCompleted);
                expect(body.data.completedDate).not.toBe(0);
                expect(body.data.text).toBe(text);
            })
            .end(done);
    });

    it("Removes completedDate when !isCompleted", done => {
        const id = sampleTodos[0]._id.toHexString();
        const isCompleted = false;
        request(app)
            .patch(`/todos/${id}`)
            .send({ isCompleted })
            .expect(200)
            .expect(({ body }) => {
                expect(body.data.isCompleted).toBe(isCompleted);
                expect(body.data.completedDate).toBe(0);
            })
            .end(done);
    })
});

describe("Posting todos", () => {

    it("is not possible w/o logging in", done => {
        request(app)
            .post("/todos")
            .expect(401)
            .expect(res => {
                expect(res.body.error).not.toBe(null);
            })
            .end(done);
    });

    it("works when logged in and todo is correct", done => {
        const text = "This is a correct todo";
        const _creatorId = sampleUsers[0]._id;
        request(app)
            .post("/todos")
            .set("x-auth", sampleUsers[0].tokens[0].token)
            .send({ text, _creatorId })
            .expect(200)
            .expect(res => {
                expect(res.body.error).toBe(null);
            })
            .end(done);
    })

    it("fails on invalid data",done => {
        let text = "    ";
        const _creatorId = sampleUsers[0]._id;
        request(app)
            .post("/todos")
            .set("x-auth", sampleUsers[0].tokens[0].token)
            .send({ text, _creatorId })
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

describe("Getting user data from /users/me", () => {
    it("works when authenticated", done => {
        request(app)
            .get("/users/me")
            .set("x-auth", sampleUsers[0].tokens[0].token)
            .expect(200)
            .expect(res => {
                const { _id, email } = sampleUsers[0];
                expect(res.body.data._id).toBe(_id.toHexString());
                expect(res.body.data.email).toBe(email)
            })
            .end(done);

    });

    it("fails when not authenticated", done => {
        request(app)
            .get("/users/me")
            .expect(401)
            .expect(res => {
                expect(res.body.error).not.toBe(null);
            })
            .end(done)

    });
});

describe("Creating users", () => {

    const validEmail = "c@c.com";
    const invalidEmail = "aaaa";
    const duplicateEmail = "a@a.com"

    const validPassword = "123456";
    const invalidPassword = "123";

    it("creates a new user", done => {
        request(app)
        .post("/users")
        .send({ email: validEmail, password:  validPassword })
        .expect(200)
        .expect(res => {
            expect(res.body.data.email).toBe(validEmail);
            expect(res.body.error).toBe(null);
        })
        .end(done);
    });

    describe("fails when", () => {
        it("email is invalid", done => {
            request(app)
                .post("/users")
                .send({
                    email: invalidEmail,
                    password: validPassword
                 })
                .expect(400)
                .expect(res => {
                    expect(res.body.err).not.toBe(null);
                })
                .end(done);
        });

        it("email already exists", done => {
            request(app)
                .post("/users")
                .send({
                    email: duplicateEmail,
                    password: validPassword
                })
                .expect(400)
                .expect(res => {
                    expect(res.body.err).not.toBe(null);
                })
                .end(done);
        });

        it("password is invalid (too short)", done => {
            request(app)
                .post("/users")
                .send({
                    email: validEmail,
                    password: invalidPassword
                })
                .expect(400)
                .expect(res => {
                    expect(res.body.err).not.toBe(null);
                })
                .end(done);
        });
    });
});

describe("Logging in", () => {
    it("works returning an auth token", done => {
        request(app)
            .post("/users/login")
            .send(sampleUsers[1])
            .expect(200)
            .expect(res => {
                expect(res.headers).toHaveProperty("x-auth");
            })
            .end((err, res) => {
                if(err) {
                    return done(err);
                }

                User.findById(sampleUsers[1]._id)
                    .then(user => {
                        const { token } = user.tokens[0];
                        expect(token).toBe(res.headers["x-auth"]);
                    })
                    .then(() => done())
                    .catch(err => done(err));
            });

    });
    it("fails with wrong credentials", done => {
        request(app)
            .post("/users/login")
            .expect(400)
            .expect(res => {
                expect(res.body.data.error).not.toBe(null);
            })
            .end(done);

    });
});

describe("Logging out", () => {
    it("removes auth token when logged in", done => {
        const testToken = sampleUsers[0].tokens[0].token;
        request(app)
            .delete("/users/me/token")
            .set("x-auth", testToken)
            .expect(200)
            .expect(res => {
                expect(res.body.error).toBe(null);
                expect(res.header).not.toHaveProperty("x-auth");
            })
            .end((err, res) => {
                if(err) {
                    return done(err);
                }

                User.findByToken(testToken)
                    .then(foundToken => {
                        expect(foundToken).toBe(null);
                        done();
                    })
                    .catch(done);
            });

    });
    it("throws error when not logged in", done => {
        request(app)
            .delete("/users/me/token")
            .expect(401)
            .expect(res => {
                expect(res.body.error).not.toBe(null);
            })
            .end(done);
    });
});
