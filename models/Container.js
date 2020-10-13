const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Container = new Schema({
  name: {
    type: String
  },
  password: {
    type: String
  },
  ipv4: {
    type: String
  }
});

exports.module = mongoose.model('Container', Container);