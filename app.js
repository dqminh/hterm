var http       = require('http');
var sockjs     = require('sockjs');
var pty        = require('pty.js');
var nodeStatic = require('node-static');
var Mincer     = require('mincer');

var termServer = sockjs.createServer();
var httpServer = http.createServer();
var environment = new Mincer.Environment();
environment.appendPath('js');

var assetsServer = Mincer.createServer(environment);
var staticDir = new nodeStatic.Server(__dirname);

httpServer.addListener('request', function(req, res) {
  if (req.url === '/application.js') {
    assetsServer(req, res);
  } else {
    staticDir.serve(req, res);
  }
});

httpServer.addListener('upgrade', function(req,res) {
  res.end();
});

function handleConnection(conn) {
  var term = pty.spawn('bash', [], {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: process.env.HOME,
    env: process.env,
  });

  term.on('data', function(data)  {
    conn.write(data);
  });

  conn.on('data', function(msg) {
    var data = JSON.parse(msg);
    if (data.type == 'key') {
      term.write(data.value);
    } else if (data.type == 'resize') {
      term.resize(data.value.cols, data.value.rows);
    }
  });

  conn.on('close', function() {
    term.destroy();
  });
}


termServer.on('connection', handleConnection)
termServer.installHandlers(httpServer, { prefix: '/term' });
httpServer.listen(8888);

