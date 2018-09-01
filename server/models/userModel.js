const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");

const salt = "jkljkljlkjkl";

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
    const token = jwt.sign({
        _id: user._id.toHexString(),
        access
    }, salt).toString();

    // ↓ workaround, as push is causing problems with some versions of mongo
    user.tokens.push({ access, token });
  
    return user.save().then(() => token);
}

// finds user by token
UserSchema.statics.findByToken = function(token) {
    const User = this;
    const decodedUser = jwt.verify(token, salt, (err, decoded) => {
        if (err) {
            return Promise.reject("Token error");
        }
        return User.findOne({
            _id: decoded._id,
            "tokens.token": token,
            "tokens.access": "auth"
        })
    });
    return decodedUser;
}

const User = mongoose.model("UserModel", UserSchema);

module.exports = { User }