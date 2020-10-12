const nodemailer = require("nodemailer");
const config = require("../config/mailer");

const transport = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: config.MAILGUN_USER,
    pass: config.MAILGUN_PASS,
  },
});

module.exports = {
  sendEmail(from, to, subject, html) {
    return new Promise((resolve, reject) => {
      transport.sendMail({ from, subject, to, html }, (err, info) => {
        if (err) {
          console.log(err);
          console.log("MAIL NOT SEND");
          reject(err);
        }
        console.log(info);
        resolve(info);
      });
    });
  },
};
