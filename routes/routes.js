var express = require('express');
var router = express.Router();

var passport = require('passport');

var User = require('../models/user');

router.use((req, res, next) => {
    // req.user is created by Passport after a successful log in
    res.locals.currentUser = req.user;

    // Setting the failureFlash option to true instructs Passport to flash an error message using the message given by the strategy's verify callback, if any.
    res.locals.errors = req.flash('error');

    res.locals.infos = req.flash('info');
    next();
});

router.get('/', (req, res, next) => {
    User.find()
        .sort({createdAt: 'descending'})
        .exec((err, users) => {
            if (err) return next(err);
            res.render('index', {users: users})
        });
});

router.get('/signup', (req, res) => {
    res.render('signup');
});

router.post('/signup', (req, res, next) => {
    var username = req.body.username;
    var password = req.body.password;

    User.findOne({username: username}, (err, user) => {
        if (err) return next(err);
        if (user) {
            req.flash('error', 'User already exists.');
            return res.redirect('/signup');
        }
        var newUser = new User({
            username: username,
            password: password
        });
        newUser.save(next);
    })
}, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/signup',
    failureFlash: true
}));

router.get('/users/:username', (req, res, next) => {
    User.findOne({username: req.params.username}, (err, user) => {
        if (err) return next(err);
        if (!user) return next(404);
        res.render('profile', {user});
    });
});

router.get('/login', (req, res) => {
    res.render('login');
});

// Passport will populate req.user and connect-flash will populate some flash values.
router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true // set an error message with connect-flash if user failes to log in
}));

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

router.get('/edit', ensureAuthenticated, (req, res) => {
    res.render('edit');
});

router.post('/edit', ensureAuthenticated, (req, res, next) => {
    req.user.displayName = req.body.displayName;
    req.user.bio = req.body.bio;
    // Mongoose's save:
    req.user.save(err => {
        if (err) {
            next(err);
            return;
        }
        req.flash('info', "Profile updated.");
        res.redirect('/edit');
    });
});


// Error handling:
router.use((err, req, res, next) => {
    res.locals.message = '"routes" routing failed.';
    res.locals.error = err;
    res.render('error');
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) next();
    else {
        req.flash('info', 'You must be logged in to see this page.');
        res.redirect('/login');
    }
}

module.exports = router;