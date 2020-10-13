const lxd = require('../misc/lxd');

exports.start = function (req, res) {
  console.log(req.body);
  lxd.generate(req.body.name)
    .then(data => {
      res.json(data);
    })
    .catch(err => {
      console.log(err);
      res.json({msg: 'Failed to create new container'});
    })
}