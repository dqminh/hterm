/**
 * This class defines a command that can be run in an hterm.Terminal instance.
 * This command creates an instance that can communicate with SSH server via a
 * websocket
 *
 * @param {Object} argv The argument object passed in from the Terminal.
 */
nassh = {CommandInstance: function() {}};

WebsocketCommandInstance = function(argv) {
  // Command arguments.
  this.argv_ = argv;
  // Command environment.
  this.environment_ = argv.environment || {};
  // hterm.Terminal.IO instance.
  this.io = null;
  // websocket
  this.sock = null;
  // Prevent us from reporting an exit twice.
  this.exited_ = false;
};

WebsocketCommandInstance.prototype.run = function(argv) {
  this.io = this.argv_.io.push();
  this.sock = new SockJS('http://localhost:8888/term');
  this.sock.onopen = this.onReady.bind(this);
  this.sock.onmessage = this.onMessage.bind(this);
  this.sock.onclose = this.exit.bind(this);
};

WebsocketCommandInstance.prototype.onReady = function() {
  this.io.println('CONNECTING');
  this.io.onVTKeystroke = this.sendString.bind(this);
  this.io.sendString = this.sendString.bind(this);
  this.io.onTerminalResize = this.onTerminalResize.bind(this);

  var argv = {};
  argv.terminalWidth = this.io.terminal_.screenSize.width;
  argv.terminalHeight = this.io.terminal_.screenSize.height;
  argv.useJsSocket = !!this.relay_;
  argv.environment = this.environment_;
  argv.writeWindow = 8 * 1024;

  document.querySelector('#terminal').focus();
  return true;
}

WebsocketCommandInstance.prototype.sendString = function(str) {
  var msg = JSON.stringify({type: 'key', value: str})
  this.sock.send(msg);
};

WebsocketCommandInstance.prototype.onMessage = function(event) {
  if (event.type == 'message') {
    this.io.print(event.data);
  }
};

WebsocketCommandInstance.prototype.onTerminalResize = function(width, height) {
  var msg = JSON.stringify({type: 'resize', value: { cols: width, rows: height}})
  this.sock.send(msg);
};

WebsocketCommandInstance.prototype.exit = function() {
}

/**
 * Send a string to the remote host.
 *
 * @param {string} string The string to send.
 */
WebsocketCommandInstance.prototype.sendString_ = function(string) {
}

/**
 * Initiate a connection to a remote host.
 *
 * @param {string} username The username to provide.
 * @param {string} hostname The hostname or IP address to connect to.
 * @param {string|integer} opt_port The optional port number to connect to.
 * @return {boolean} False if there was some trouble with the parameters, true
 *     otherwise.
 */
nassh.CommandInstance.prototype.connectTo = function(params) {
  if (!(params.username && params.hostname))
    return false;

  this.io.setTerminalProfile(params.terminalProfile || 'default');

  // TODO(rginda): The "port" parameter was removed from the CONNECTING message
  // on May 9, 2012, however the translations haven't caught up yet.  We should
  // remove the port parameter here once they do.
  this.io.println(hterm.msg('CONNECTING',
                            [params.username + '@' + params.hostname,
                             (params.port || '??')]));
  this.io.onVTKeystroke = this.sendString_.bind(this);
  this.io.sendString = this.sendString_.bind(this);
  this.io.onTerminalResize = this.onTerminalResize_.bind(this);

  var argv = {};
  argv.terminalWidth = this.io.terminal_.screenSize.width;
  argv.terminalHeight = this.io.terminal_.screenSize.height;
  argv.useJsSocket = !!this.relay_;
  argv.environment = this.environment_;
  argv.writeWindow = 8 * 1024;

  argv.arguments = ['-C'];  // enable compression

  // Disable IP address check for connection through proxy.
  if (argv.useJsSocket)
    argv.arguments.push("-o CheckHostIP=no");

  var commandArgs;
  if (params.argstr) {
    var ary = params.argstr.match(/^(.*?)(?:(?:^|\s+)(?:--\s+(.*)))?$/);
    if (ary) {
      console.log(ary);
      if (ary[1])
        argv.arguments = argv.arguments.concat(ary[1].split(/\s+/));
      commandArgs = ary[2];
    }
  }

  if (params.identity)
    argv.arguments.push('-i/.ssh/' + params.identity);
  if (params.port)
    argv.arguments.push('-p' + params.port);

  argv.arguments.push(params.username + '@' + params.hostname);
  if (commandArgs)
    argv.arguments.push(commandArgs);

  var self = this;
  this.initPlugin_(function() {
      window.onbeforeunload = self.onBeforeUnload_.bind(self);
      self.sendToPlugin_('startSession', [argv]);
    });

  document.querySelector('#terminal').focus();

  return true;
};

/**
 * Dispatch a "message" to one of a collection of message handlers.
 */
nassh.CommandInstance.prototype.dispatchMessage_ = function(
    desc, handlers, msg) {
  if (msg.name in handlers) {
    handlers[msg.name].apply(this, msg.argv);
  } else {
    console.log('Unknown "' + desc + '" message: ' + msg.name);
  }
};

/**
 * Send a message to the nassh plugin.
 *
 * @param {string} name The name of the message to send.
 * @param {Array} arguments The message arguments.
 */
nassh.CommandInstance.prototype.sendToPlugin_ = function(name, args) {
  var str = JSON.stringify({name: name, arguments: args});

  this.plugin_.postMessage(str);
};

/**
 * Send a string to the remote host.
 *
 * @param {string} string The string to send.
 */
nassh.CommandInstance.prototype.sendString_ = function(string) {
  this.sendToPlugin_('onRead', [0, btoa(string)]);
};

/**
 * Notify plugin about new terminal size.
 *
 * @param {string|integer} terminal width.
 * @param {string|integer} terminal height.
 */
nassh.CommandInstance.prototype.onTerminalResize_ = function(width, height) {
  this.sendToPlugin_('onResize', [Number(width), Number(height)]);
};

/**
 * Exit the nassh command.
 */
nassh.CommandInstance.prototype.exit = function(code) {
  window.onbeforeunload = null;

  this.io.println(hterm.msg('DISCONNECT_MESSAGE', [code]));
  this.io.println(hterm.msg('RECONNECT_MESSAGE'));
  this.io.onVTKeystroke = function(string) {
    var ch = string.toLowerCase();
    if (ch == 'r' || ch == ' ' || ch == '\x0d' /* enter */)
      this.reconnect(document.location.hash.substr(1));

    if (ch == 'c' || ch == '\x12' /* ctrl-r */) {
      document.location.hash = '';
      document.location.reload();
      return;
    }

    if (ch == 'e' || ch == 'x' || ch == '\x1b' /* ESC */ ||
        ch == '\x17' /* C-w */) {
      if (this.exited_)
        return;

      this.exited_ = true;
      this.io.pop();
      if (this.argv_.onExit)
        this.argv_.onExit(code);
    }
  }.bind(this);
};

nassh.CommandInstance.prototype.onBeforeUnload_ = function(e) {
  var msg = hterm.msg('BEFORE_UNLOAD');
  e.returnValue = msg;
  return msg;
};

/**
 * Called when the plugin sends us a message.
 *
 * Plugin messages are JSON strings rather than arbitrary JS values.  They
 * also use "arguments" instead of "argv".  This function translates the
 * plugin message into something dispatchMessage_ can digest.
 */
nassh.CommandInstance.prototype.onPluginMessage_ = function(e) {
  var msg = JSON.parse(e.data);
  msg.argv = msg.arguments;
  this.dispatchMessage_('plugin', this.onPlugin_, msg);
};

/**
 * Connect dialog message handlers.
 */
nassh.CommandInstance.prototype.onConnectDialog_ = {};

/**
 * Plugin message handlers.
 */
nassh.CommandInstance.prototype.onPlugin_ = {};

/**
 * Log a message from the plugin.
 */
nassh.CommandInstance.prototype.onPlugin_.printLog = function(str) {
  console.log('plugin log: ' + str);
};

/**
 * Plugin has exited.
 */
nassh.CommandInstance.prototype.onPlugin_.exit = function(code) {
  console.log('plugin exit: ' + code);
  this.sendToPlugin_('onExitAcknowledge', []);
  this.exit(code);
};

nassh.CommandInstance.prototype.onPlugin_.openSocket = function(
    fd, host, port) {
  if (!this.relay_) {
    this.sendToPlugin_('onOpenSocket', [fd, false]);
    return;
  }

  var self = this;
  var stream = this.relay_.openSocket(
      fd, host, port,
      function onOpen(success) {
        self.sendToPlugin_('onOpenSocket', [fd, success]);
      });

  stream.onDataAvailable = function(data) {
    self.sendToPlugin_('onRead', [fd, data]);
  };

  stream.onClose = function(reason) {
    console.log('close: ' + fd);
    self.sendToPlugin_('onClose', [fd, reason]);
  };
};
