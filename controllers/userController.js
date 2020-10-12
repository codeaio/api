const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const secret = "teamcodeaio";
const randomstring = require("randomstring");
const mailer = require("../misc/mailer");

exports.get = function (req, res) {
  try {
    var payload = jwt.verify(req.body.token, secret);
    var user = {
      name: payload.name,
      email: payload.email,
    };
    return res.json({ user: user, ok: true });
  } catch (e) {
    return req.json({ errors: [{ msg: "User not found!" }], ok: false });
  }
};

exports.signup = function (req, res) {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  if (!name || !email || !password || !password2) {
    errors.push({ msg: "Please fill in all fields" });
  }
  if (password !== password2) {
    errors.push({ msg: "Password do not match" });
  }

  if (password.length < 6) {
    errors.push({ msg: "Password should be at least 6 character" });
  }

  if (errors.length > 0) {
    return res.json({ ...errors, ok: false });
  } else {
    User.findOne({ email: email }).then((user) => {
      if (user) {
        errors.push({ msg: "Email is already Registered" });
        return res.json({ errors: errors, ok: false });
      } else {
        const secretToken = randomstring.generate(20);

        var active = false;
        const newUser = new User({
          name,
          email,
          password,
          secretToken,
          active,
        });

        //Hash Password
        bcrypt.genSalt(10, (err, salt) =>
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            //Set Password to Hash
            newUser.password = hash;
            newUser
              .save()
              .then(async (user) => {
                try {
                  const html = `Hi there,
                  <br/>
                  Thank you for registering!
                  <br/><br/>
                  Please verify your email by click the following link:
                  <br/>
                  On the following page:
                  <a href="http://localhost:5000/users/verify">http://localhost:5000/users/verify</a>
                  <br/><br/>
                  Have a pleasant day.`;

                  // Send email
                  await mailer.sendEmail(
                    "noreply-codeaio@gmail.com",
                    newUser.email,
                    "Please verify your email!",
                    html
                  );
                  return res.json({
                    msg: "check your inbox",
                    ok: true,
                  });
                } catch (error) {
                  console.log(error);
                }
              })
              .catch((err) => console.log(err));
          })
        );
      }
    });
  }
};

exports.signin = function (req, res) {
  const { email, password } = req.body;
  User.findOne({ email: email }).then((user) => {
    if (!user) {
      return res.json({
        errors: [{ msg: "Invalide Email or Password" }],
        ok: false,
      });
    }

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) throw err;
      if (!user.active) {
        return res.json({
          errors: [{ msg: "Please activate your account before register" }],
          ok: false,
        });
      }
      if (isMatch) {
        if (err) {
          return res.json({
            errors: [{ msg: "Unknown Problem" }],
            ok: false,
          });
        }
        const token = jwt.sign(user.toJSON(), secret);
        user = {
          name: user.name,
          email: user.email,
        };
        return res.json({ user: user, token: token, ok: true });
      } else {
        return res.json({
          errors: [{ msg: "Invalide Email or Password" }],
          ok: false,
        });
      }
    });
  });
};

exports.verify = function (req, res) {
  User.findOne({ secretToken: req.query.token }).then((user) => {
    if (user) {
      if (user.active) {
        return res.json("already active");
      }
      user.active = true;
      user.save();
      return res.json("validated");
    } else {
      return res.json("invalide token");
    }
  });
};
