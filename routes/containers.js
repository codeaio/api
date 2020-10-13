const express = require("express");
const router = express.Router();
const container = require("../controllers/continerController");

router.post("/", container.start);

module.exports = router;