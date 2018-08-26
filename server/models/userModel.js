const mongoose = require("mongoose");
const validator = require("validator");

const User = mongoose.model("UserModel", {
    email: {
        type: String,
        required: true,
        minlength: 5,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: "{VALUE} is not a valid email."
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        tokens: [{
            access: {
                type: String,
                required: true
            },
            token: {
                type: String,
                required: true
            }
        }]
    }
});

module.exports = {
    User
}