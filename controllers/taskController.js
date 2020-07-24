var mongoose = require('mongoose')
    require('../models/taskModel');
    Task = mongoose.model('Tasks');

exports.create = function(req, res) {
    var new_task = new Task(req.body);
    // console.log(new_task);
    new_task.save(function(err, task) {
        if (err)
            res.send(err);
        // console.log(task);
        res.json(task);
    });
}

exports.find_by_id = function(req, res) {
    Task.findOne({ _id: req.params.taskId }, function (err, task) {
        if (err) {
            res.send(err);
        }
        res.json(task);
    });
}

exports.submit = function(req, res) {
    var completed_task = req.body;
    // console.log(completed_task);
    Task.findOne({ _id: completed_task.id }, function (err, task) {
        if (err) {
            res.send(err);
        }
        task.status = 'completed';
        task.stdout = completed_task.stdout;
        task.stderr = completed_task.stderr;
        task.err = completed_task.err;
        // console.log(task);
        task.save();
    });
    res.send(JSON.stringify("submitted"));
}

exports.assing = function(req, res) {
    Task.findOne({ status: 'pending' }, function(err, task) {
        if (err) {
            res.send(err)
        }
        if (task) {
            res.json(task);
            task.status = "running";
            task.save();
        } else {
            res.json({});
        }
    });
}

exports.all = function(req, res) {
    Task.find({}, function(err, task) {
        if (err)
            res.send(err);
        res.json(task);
    });
}