const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema({
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
    }, 
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
});

// overrides the basic toJSON to only return certain values
UserSchema.methods.toJSON = function () {
    const user = this;
    const { _id, email } = user.toObject();
    return { _id, email };
}


// called on instance of user, so this === user
UserSchema.methods.generateAuthToken = function () {
    const user = this; 
    const access = "auth";
    const salt = "jkljkljlkjkl";
    const token = jwt.sign({
        _id: user._id.toHexString(),
        access
    }, salt).toString();

    // ↓ workaround, as push is causing problems with some versions of mongo
    user.tokens.push({ access, token });
  
    return user.save().then(() => token);
}

const User = mongoose.model("UserModel", UserSchema);

module.exports = { User }