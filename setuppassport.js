var passport = require('passport');

var User = require('./models/user');
var LocalStrategy = require('passport-local').Strategy;

module.exports = function () {
    // to the client (ID)
    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    // deserialize User from client's ID
    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user);
        });
    });

    passport.use(new LocalStrategy(
        function (username, password, done) {
            User.findOne({username: username}, function (err, user) {
                if (err) {
                    return done(err);
                }
                if (!user) {
                    return done(null, false, { message: 'Incorrect username.' });
                }
                user.checkPassword(password, (err, result) => {
                    if (err) return done(err);

                    if (result) return done(null, user);
                    else return done(null, false, { message: "Invalid password." });
                })
            });
        }
    ));
};