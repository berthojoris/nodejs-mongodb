var express = require('express');
var router = express.Router();
var User = require('../models/user');
var moment = require('moment');

router.get('/', function(req, res, next) {
    if (!req.session.userId) {
        return res.render('register.ejs');
    } else {
        return res.redirect('/profile');
    }
});


router.post('/', function(req, res, next) {
    console.log(req.body);
    var personInfo = req.body;

    if (!personInfo.email || !personInfo.username || !personInfo.password || !personInfo.passwordConf) {
        res.send();
    } else {
        if (personInfo.password == personInfo.passwordConf) {

            User.findOne({ email: personInfo.email }, function(err, data) {
                if (!data) {
                    var c;
                    User.findOne({}, function(err, data) {

                        if (data) {
                            c = data.unique_id + 1;
                        } else {
                            c = 1;
                        }

                        var newPerson = new User({
                            unique_id: c,
                            email: personInfo.email,
                            username: personInfo.username,
                            password: personInfo.password,
                            passwordConf: personInfo.passwordConf,
                        });

                        newPerson.save(function(err, Person) {
                            if (err)
                                console.log(err);
                            else
                                console.log('Success');
                        });

                    }).sort({ _id: -1 }).limit(1);

                    res.status(200);
                    res.json({ "msg": "You are regestered, You can login now." });
                } else {
                    res.status(403);
                    res.json({ "msg": "Email is already used" });
                }

            });
        } else {
            res.send({ "Success": "password is not matched" });
        }
    }
});

router.get('/login', function(req, res, next) {
    if (!req.session.userId) {
        return res.render('newlogin.ejs');
    } else {
        return res.redirect('/profile');
    }
});

router.post('/login', function(req, res, next) {
    User.findOne({ email: req.body.email }, function(err, data) {

        if (data) {

            if (data.password == req.body.password) {
                req.session.userId = data.unique_id;

                req.session.user = data;????????
                req.session.save();

                const update = {
                    loginStart: Math.floor(Date.now() / 1000),
                    loginEnd: Math.floor(Date.now() / 1000),
                };

                User.updateOne({ email: req.body.email }, update, (err, res) => {
                    //
                });

                res.status(200);
                res.json({ "msg": "Login Success" });
            } else {
                res.status(401);
                res.json({ "msg": "Wrong Password" });
            }
        } else {
            res.status(404);
            res.json({ "msg": "User not found" });
        }
    });
});

router.get('/profile', function(req, res, next) {
    console.log("profile");
    User.findOne({ unique_id: req.session.userId }, function(err, data) {
        if (!data) {
            res.redirect('/');
        } else {
            return res.render('profile.ejs', {
                "name": data.username,
                "email": data.email
            });
        }
    });
});

router.get('/logout', function(req, res, next) {

    User.findOne({ unique_id: req.session.userId }, function(err, data) {
        if (!data) {} else {
            const update = { loginEnd: Math.floor(Date.now() / 1000) };
            User.updateOne({ unique_id: data.unique_id }, update, (err, res) => {
                //
            });
        }
    });

    if (req.session) {
        req.session.destroy(function(err) {
            if (err) {
                return next(err);
            } else {
                return res.redirect('/login');
            }
        });
    }
});

router.get('/calculator', function(req, res, next) {

    if (!req.session.userId) {
        return res.redirect('/login');
    } else {
        const sessionuser = req.session.user;

        res.render("cal.ejs", { "session": sessionuser });
    }
});

module.exports = router;