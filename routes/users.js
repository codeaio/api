const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const secret = "teamcodeaio";
//User module
const User = require('../models/User');
// Login Page
router.get('/login',(req,res) => res.render('login'));

//Register Page
router.get('/register',(req,res) => res.render('register'));

//Register Handle
router.post('/register',(req,res) => {
    const {name,email,password,password2 } = req.body;
    let errors = [];

    //check required fields
    if(!name || !email || !password || !password2)
    {
        errors.push({msg:'Please fill in all fields'});
    }

    //check passwords match
    if(password !== password2)
    {
        errors.push({msg:'Password do not match'});
    }

    //check pass length
    if(password.length < 6)
    {
        errors.push({msg:'Password should be at least 6 character'});
    }

    if(errors.length > 0)
    {
        res.render('register',{
            errors,
            name,
            email,
            password,
            password2
        });
    }
    else
    {
        //Validation Passed
        User.findOne({ email : email })
            .then(user => {
                if(user)
                {
                    //User Exist
                    errors.push({msg : 'Email is already Registered'});
                    res.render('register',{
                        errors,
                        name,
                        email,
                        password,
                        password2
                    });
                }
                else{
                    const newUser = new User({
                        name,
                        email,
                        password,

                    });
                    //Hash Password
                    bcrypt.genSalt(10,(err,salt) => bcrypt.hash(newUser.password,salt,(err,hash) => {
                        if(err) throw err;
                        //Set Password to Hash
                        newUser.password = hash;
                        newUser.save()
                        .then(user => {
                            console.log('save successfully');
                            req.flash('success_msg','You are now Registerd and You can log in');
                            res.redirect('/users/login');
                        })
                        .catch(err => console.log(err));
                    }));
                }
            });
        

    }
});
//Login Hnadler
router.post('/login',(req,res,next) => {

    passport.authenticate('local', {session: false}, function(err, user, info) {
      if (err) { return next(err); }
      if (!user) { return res.redirect('/user/login'); }
      req.logIn(user, {session: false}, function(err) {
        if (err) { return next(err); }
        const token = jwt.sign(user.toJSON(), secret);
        return res.json({user, token});
      });
    })(req,res,next);
  
    // passport.authenticate('local',{
    //     successRedirect: 'http://localhost:3001/?'+req._id,
    //     failureRedirect: '/users/login',
    //     failureFlash: true
    // })(req,res,next);
});
module.exports = router;