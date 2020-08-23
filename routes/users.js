const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const secret = "teamcodeaio";
const randomstring = require('randomstring');
const mailer = require('../misc/mailer');

//User module
const User = require('../models/User');

// Authorization 
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    } else {
      req.flash('error', 'Sorry, but you must be registered first!');
      res.redirect('/');
    }
  };
  
  const isNotAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      req.flash('error', 'Sorry, but you are already logged in!');
      res.redirect('/');
    } else {
      return next();
    }
  };

  router.get('/login',(req,res) => res.render('login'));

//Register Page
router.get('/register',(req,res) => res.render('register'));
router.route('/verify')
  .get(isNotAuthenticated, (req, res) => {
    res.render('verify');
  })

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
                } else {


                    // Generate secret token
                    const secretToken = randomstring.generate(5);
                    console.log('secretToken', secretToken);

                    // Flag account as inactive
                    var active = false;

                    const newUser = new User({
                        name,
                        email,
                        password,
                        secretToken,
                        active
                    });

                    //Hash Password
                    bcrypt.genSalt(10, (err,salt) => bcrypt.hash(newUser.password,salt,(err,hash) => {
                        if(err) throw err;
                        //Set Password to Hash
                        newUser.password = hash;
                        newUser.save()
                        .then(async user => {
                            console.log('save successfully');
                            try {
                                const html = `Hi there,
                                <br/>
                                Thank you for registering!
                                <br/><br/>
                                Please verify your email by typing the following token:
                                <br/>
                                Token: <b>${secretToken}</b>
                                <br/>
                                On the following page:
                                <a href="http://localhost:5000/users/verify">http://localhost:5000/users/verify</a>
                                <br/><br/>
                                Have a pleasant day.` 
    
                                // Send email
                                await mailer.sendEmail('dhruvchauhanbb@gmail.com', newUser.email, 'Please verify your email!', html);
    
                                req.flash('success', 'Please check your email.');
                                res.redirect('/users/login');
                            } catch(error) {
                                next(error);
                            }
 //                           req.flash('success_msg','You are now Registerd and You can log in');
 //                           res.redirect('/users/login');
                        })
                        .catch(err => console.log(err));
                        
                        // Compose email
                    }));
                }
            });
    }
});
//Login Hnadler
router.post('/login',(req,res,next) => {

    passport.authenticate('local', {session: false}, function(err, user, info) {
      if (err) { return next(err); }
      if (!user) { return res.redirect('/users/login'); }
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

router.route('/verify')
  .get(isNotAuthenticated, (req, res) => {
    res.render('verify');
  })
  .post(async (req, res, next) => {
    try {
      const { secretToken } = req.body;

      // Find account with matching secret token
      const user = await User.findOne({ 'secretToken': secretToken });
      if (!user) {
        req.flash('error', 'No user found.');
        res.redirect('/users/verify');
        return;
      }

      user.active = true;
      user.secretToken = '';
      await user.save();

      req.flash('success', 'Thank you! Now you may login.');
      res.redirect('/users/login');
    } catch(error) {
      next(error);
    }
  })

module.exports = router;