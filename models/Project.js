const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const ProjectSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  owner: {
    type: Object,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  container: {
    type: Object,
    required: false
  }
});

module.exports = Project = mongoose.model("projects", ProjectSchema);
