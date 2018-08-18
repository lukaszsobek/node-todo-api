const mongoose = require("mongoose");

const User = mongoose.model("UserModel", {
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
    User
}