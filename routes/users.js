const express = require("express");
const router = express.Router();
const User = require("../models/User");
const user = require("../controllers/userController");

router.post("/", user.get);
router.post("/signup", user.signup);
router.post("/signin", user.signin);
router.get("/verify", user.verify);

module.exports = router;
