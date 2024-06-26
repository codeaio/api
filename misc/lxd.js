var axios = require('axios');
const fs = require('fs');
const API = "https://127.0.0.1:8443";
const https = require('https');
var path = require("path");

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
  cert: fs.readFileSync(path.join(__dirname, "lxd.crt")),
  key: fs.readFileSync(path.join(__dirname, "lxd.key")),
  passphrase: "YYY"
});

axios = axios.create({ httpsAgent });

async function newContainer(name, template) {
  let alias = "";
  console.log(template);
  if (template === "none") {
    alias = "code-server";
  } else if (template === "nodejs") {
    alias += "code-server-nodejs";
  } else if (template === "java") {
    alias += "code-server-java";
  } else if (template === "react") {
    alias += "code-server-react";
  }

  console.log(alias);
  try {
    var res = await axios.post(API + "/1.0/instances", {
      name: name,
      architecture: "x86_64",
      profile: ["default"],
      type: "container",
      source: {
        type: "image",
        alias: alias
      }
    })
    res = await axios.get(API + "/1.0/operations/"+res.data.metadata.id+"/wait");
    return res;
  } catch (err) {
    throw err;
  }
}

async function start(name) {
  try {
    var res = await axios.put(API + "/1.0/instances/"+name+"/state", { action: "start", force: true });
    res = await axios.get(API + "/1.0/operations/"+res.data.metadata.id+"/wait");
    return res;
  } catch (err) {
    throw err;
  }
}

async function ipv4(name) {
  try {
    var res = await axios.get(API + "/1.0/instances/"+name+"/state");
    var ips = res.data.metadata.network.eth0.addresses;
    for (var i = 0; i < ips.length; i++) {
      if (ips[i].family == 'inet') {
        return ips[i].address;
      }
    }
    res = await ipv4(name);
    return res;
  } catch (err) {
    throw err;
  }
}

async function download(name, path) {
  try {
    var res = await axios.get(encodeURI(API + "/1.0/instances/" + name + "/files?path=" + path));
    return res;
  } catch (err) {
    throw err;
  }
}

async function upload(name, path, text) {
  try {
    var axios_config = {
      headers: {
        'Content-Length' : 0,
        'Content-Type': 'text/plain'
      },
      responseType: 'text'
    };
    var res = await axios.post(encodeURI(API + "/1.0/instances/" + name + "/files?path=" + path), text, axios_config);
    return res;
  } catch (err) {
    throw err;
  }
}

async function execLXD(name, command) {
  try {
    var res = await axios.post(API + "/1.0/instances/"+name+"/exec", { 
      command: command,
      "wait-for-websocket": false,
      "record-output": true,
      interactive: false 
    })
    return res;
  } catch(err) {
    throw err;
  }
}

exports.generate = async function(name, template) {
  try {
    console.log("hi");
    var response = {};
    var resp = await newContainer(name, template);
    console.log(resp.data);
    resp = await start(name);
    console.log(resp.data);
    var ip = await ipv4(name);
    var down_res = await download(name, '/root/.config/code-server/config.yaml');
    var s = down_res.data;
    var r = s.split('\n');
    var obj = {};
    r.forEach(str => {
      var t = str.split(": ");
      obj[t[0]] = t[1];
    })
    obj['bind-addr'] = ip;
    console.log(ip);
    response.obj = obj;
    var config = "bind-addr: " + obj['bind-addr'] + ":8080" + "\nauth: " + obj.auth + "\npassword: " + obj.password + "\ncert: " + obj.cert;
    var up_res = await upload(name, '/root/.config/code-server/config.yaml', config);
    if (template === "react") {
      await execLXD(name, ['mv', 'my-app', name]);
    } else {
      await execLXD(name, ['mkdir', name]);
    }
    await execLXD(name, ['code-server', '--auth', 'none']);
    return response;
  } catch(err) {
    throw err;
  }
}