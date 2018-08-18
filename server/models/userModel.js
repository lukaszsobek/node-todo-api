const mongoose = require("mongoose");

const UserModel = mongoose.model("UserModel", {
    username: {
        type: String,
        required: true,
        minlength: 3
    },
    email: {
        type: String,
        required: true,
        minlength: 5
    }
});

module.exports = {
    UserModel
}