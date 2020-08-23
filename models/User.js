const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TaskSchema = new Schema({
    email: {
        type: String,
        default: 'anonymous@any.com'
    },
    code: {
        type: String,
        require: 'code not found'
    },
    input: {
        type: String,
        default: ""
    },
    err: {
        type: String,
        default: ""
    },
    stdout: {
        type: String,
        default: ""
    },
    stderr: {
        type: String,
        default: ""
    },
    status: {
        type: [{
            type: String,
            enum: ['pending', 'running', 'completed']
        }],
        default: 'pending'
    },
});

const UserSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    secretToken: String,
    active: Boolean,
    date:{
        type: Date,
        default: Date.now
    },
    tasks: [TaskSchema]
});

const User = mongoose.model('User',UserSchema);
module.exports = User;