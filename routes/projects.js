const express = require("express");
const router = express.Router();
const projects = require("../controllers/projectController");

router.get("/", projects.getAll);
router.get("/:id", projects.getById);
router.post("/create", projects.create);
router.patch("/update", projects.update);
router.delete("/delete/:id", projects.deleteById);

module.exports = router;
