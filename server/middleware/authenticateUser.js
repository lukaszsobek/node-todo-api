const { User } = require("../models/userModel");

const authenticateUser = (req,res,next) => {
    const token = req.header("x-auth");
    User.findByToken(token)
        .then(authUser => {
            if(!authUser) {
                return Promise.reject("No user found");
            }

            req.user = authUser;
            req.token = token;
            next();
        })
        .catch(err => res.status(401).send({ data: {}, error: err }));
}

module.exports = { authenticateUser }