const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

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

// removes token from user aka logs him out
UserSchema.methods.removeToken = function(token) {
    const user = this;
    return user.update({
        $pull: {
            tokens: { token }
        }
    });
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

// finds user by email
UserSchema.statics.findByCredentials = function(email, password) {
    const User = this;
    const rejectionMsg = "User not found!";
    return User.findOne({ email })
        .then(foundUser => {
            if(!foundUser) {
                return Promise.reject(rejectionMsg);
            }
            return bcrypt
                .compare(password.toString(), foundUser.password)
                .then(isPasswordCorrect => {
                    if(!isPasswordCorrect) {
                        return Promise.reject(rejectionMsg);
                    }
        
                    return foundUser;
                });
        })
        .catch(() => rejectionMsg );
}

UserSchema.pre("save", function(next) {
    const user = this;
    const shouldHashPassword = user.isModified("password");

    if(shouldHashPassword) {
        bcrypt.genSalt(10,(err, salt) => {
            if(err) return err;

            bcrypt.hash(user.password, salt, (err, hash) => {
                if(err) return err;
                
                user.password = hash;
                next();
            });
        });
     } else {
         next();
     }
});

const User = mongoose.model("UserModel", UserSchema);

module.exports = { User, salt }