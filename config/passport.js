const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const passport    = require('passport');
const passportJWT = require("passport-jwt");
const JWTStrategy   = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

//Load User Model
const User = require('../models/User');

module.exports = function(passport) {
    //console.log(passport);
    passport.use(
        new LocalStrategy({ usernameField: 'email'}, (email,password,done) => {
            //Match User model
            //console.log(email, password, done);
            User.findOne({ email : email})
                .then((user) => {
                    //console.log(user);
                    if(!user) {
                        return done(null,false,{message : 'That email is not Register'});
                    }

                    // Match PAssword 
                    bcrypt.compare(password,user.password,(err,isMatch) => {
                        if(err) throw err;
                        if (!user.active) {
                            return done(null, false, { message: 'Sorry, you must validate email first' });
                        }
                        if(isMatch)
                        {
                            return done(null,user);
                        }
                        else{
                            return done(null,false,{message : 'That email is not Register'});
                        }
                    });
                })
                .catch(err => console.log(err))
        })
    );
    passport.serializeUser(function(user, done) {
        done(null, user.id);
      });
      
    passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
    });
}

const secret = "teamcodeaio";

passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey   : secret
},
function (jwtPayload, cb) {

    //find the user in db if needed. This functionality may be omitted if you store everything you'll need in JWT payload.
    return User.findOneById(jwtPayload.id)
        .then(user => {
            return cb(null, user);
        })
        .catch(err => {
            return cb(err);
        });
}
));

