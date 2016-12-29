var mongoose = require('mongoose');
var bcrypt = require('bcrypt-node');

var SALT_FACTOR = 10;

var userSchema = mongoose.Schema({
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    createdAt: {type: Date, default: Date.now},
    displayName: String,
    bio: String
});

userSchema.methods.name = function () {
    return this.displayName || this.username;
};

var noop = function () {}

userSchema.pre('save', function (done) {
    var user = this;
    if (!user.isModified('password')) {
        return done();
    }
    bcrypt.genSalt(SALT_FACTOR, (err, salt) => {
        if (err) return done(err);
        bcrypt.hash(user.password, salt, noop, (err, hashedPassword) => {
            if (err) return done(err);
            user.password = hashedPassword;
            done();
        });
    });
});

userSchema.methods.checkPassword = function (guess, done) {
    bcrypt.compare(guess, this.password, (err, result) => {
        // result: true or false
        done(err, result);
    });
};

var User = mongoose.model("User", userSchema);


module.exports = User;