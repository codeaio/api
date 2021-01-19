const jwt = require("jsonwebtoken");
const Project = require("../models/Project");
const mailer = require("../misc/mailer");
const lxd = require('../misc/lxd');
const fs = require('fs');
const { execSync } = require("child_process");

const secret = "teamcodeaio";

// @route GET api/projects
exports.getAll = async (req, res) => {
  try {
    console.log(req.query);
    var payload = jwt.verify(req.query.token, secret);
    var OWNER = {
      _id: payload._id,
      name: payload.name,
      email: payload.email,
    };
    console.log(payload);
    console.log(req.body);
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


// @route GET api/projects/:id
exports.getById = (req, res) => {
  let id = req.params.id;

  Project.findById(id).then(project => res.json(project));
}

async function createContainer(name, template) {
  var data = await lxd.generate(name, template);

  return data;
}

// @route POST api/projects/create
exports.create = async (req, res) => {
  var payload = jwt.verify(req.body.token, secret);
  var OWNER = {
    _id: payload._id,
    name: payload.name,
    email: payload.email,
  };
  console.log(req.body);
  var container = await createContainer(req.body.projectName, req.body.template, OWNER._id);

  const NEW_PROJECT = await new Project({
    owner: OWNER,
    name: req.body.projectName,
    container: container.obj,
  });
  const html = `
    Password for your new project ${req.body.projectName} is ${container.obj.password}
  `;
  mailer.sendEmail(
    "noreply-codeaio@gmail.com",
    OWNER.email,
    "New Container credentials",
    html
  );

  NEW_PROJECT.save().then(async project => {
    
    Project.find({})
    .then(async projects => {
      var projects_location = "";

      projects.forEach(project => {
        projects_location += `
          location /container/${project.container["bind-addr"]}/ {
            proxy_pass http://${project.container["bind-addr"]}:8080/;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection upgrade;
            proxy_set_header Accept-Encoding gzip;
          }
        `;
      });

      var file = `
        server {
          listen 80 default_server;
          listen [::]:80 default_server;
        
          server_name _;
        
          location / {
            proxy_pass http://localhost:3000;
          }
        
          location /api {
            proxy_pass http://localhost:5000;
          }
          ${projects_location}
        
          location /phpmyadmin {
            index index.php;
          }
        
          location ~ \.php$ {
            include snippets/fastcgi-php.conf;
            fastcgi_pass unix:/var/run/php/php7.4-fpm.sock;
          }	
        }
      `;

      fs.writeFileSync('/etc/nginx/sites-enabled/default', file);
      execSync("systemctl reload nginx")
      res.json(project)
    })
  });
}

// @route PATCH api/projects/update
exports.update = (req, res) => {
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

// @route DELETE api/projects/delete/:id
exports.deleteById = (req, res) => {
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

