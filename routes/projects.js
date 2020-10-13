const express = require("express");
const router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");
const Project = require("../models/Project");
const secret = "teamcodeaio";

// @route GET api/projects
// @desc Get all projects for a specific user
// @access Private
router.get(
  "/",
  async (req, res) => {
    try {
      var payload = jwt.verify(req.body.token, secret);
      var OWNER = {
        _id: payload._id,
        name: payload.name,
        email: payload.email,
      };

      console.log(OWNER);

      // Combine with owner projects
      await Project.find({ owner: OWNER })
      .then(projects => {
        let finalArr = [...projects];
        res.json(finalArr);
      })
      .catch(err => console.log(err));
    } catch (e) {
      return res.json({ errors: [{ msg: "User not found!" }], ok: false });
    }
  }
);

// @route GET api/projects/:id
// @desc Get specific project by id
// @access Private
router.get(
  "/:id",
  (req, res) => {
    let id = req.params.id;

    Project.findById(id).then(project => res.json(project));
  }
);

// @route POST api/projects/create
// @desc Create a new project
// @access Private
router.post(
  "/create",
  async (req, res) => {
    var payload = jwt.verify(req.body.token, secret);
    var OWNER = {
      _id: payload._id,
      name: payload.name,
      email: payload.email,
    };

    console.log(req.body, OWNER);

    const NEW_PROJECT = await new Project({
      owner: OWNER,
      name: req.body.projectName,
    });

    NEW_PROJECT.save().then(project => res.json(project));
  }
);

// @route PATCH api/projects/update
// @desc Update an existing project
// @access Private
router.patch(
  "/update",
  (req, res) => {
    try {
      let projectFields = {};
      var payload = jwt.verify(req.body.token, secret);
      var OWNER = {
        _id: payload._id,
        name: payload.name,
        email: payload.email,
      };

      projectFields.name = req.body.projectName;
      console.log(req.body);
      Project.findOneAndUpdate(
        { _id: req.body.id },
        { $set: projectFields },
        { new: true }
      )
        .then(project => {
          res.json(project);
        })
        .catch(err => console.log(err));
    } catch (e) {
      return res.json({ errors: [{ msg: "User not found!" }], ok: false });
    }
  }
);

// @route DELETE api/projects/delete/:id
// @desc Delete an existing project
// @access Private
router.delete(
  "/delete/:id",
  (req, res) => {
    var payload = jwt.verify(req.body.token, secret);
    var OWNER = {
      _id: payload._id,
      name: payload.name,
      email: payload.email,
    };
    Project.findById(req.params.id).then(project => {
      project.remove().then(() => res.json({ success: true }));
    });
  }
);

module.exports = router;
