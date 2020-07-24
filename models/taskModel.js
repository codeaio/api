var mongoose = require('mongoose');
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
    }
});

exports.module = mongoose.model('Tasks', TaskSchema);