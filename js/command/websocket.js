(function(Command) {
  'use strict';
  /**
   * This class defines a command that can be run in an hterm.Terminal instance.
   * This command creates an instance that can communicate with SSH server via a
   * websocket
   *
   * @param {Object} argv The argument object passed in from the Terminal.
   */
  var Websocket = function(argv) {
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

  Websocket.prototype.run = function(argv) {
    this.io = this.argv_.io.push();
    this.sock = new SockJS('http://localhost:8888/term');
    this.sock.onopen = this.onReady.bind(this);
    this.sock.onmessage = this.onMessage.bind(this);
    this.sock.onclose = this.exit.bind(this);
  };

  Websocket.prototype.onReady = function() {
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

  Websocket.prototype.sendString = function(str) {
    var msg = JSON.stringify({type: 'key', value: str})
      this.sock.send(msg);
  };

  Websocket.prototype.onMessage = function(event) {
    if (event.type == 'message') {
      this.io.print(event.data);
    }
  };

  Websocket.prototype.onTerminalResize = function(width, height) {
    var msg = JSON.stringify({type: 'resize', value: { cols: width, rows: height}})
      this.sock.send(msg);
  };

  Websocket.prototype.exit = function() {
  }

  /**
   * Send a string to the remote host.
   *
   * @param {string} string The string to send.
   */
  Websocket.prototype.sendString_ = function(string) {
  }

  Command.Websocket = Websocket;
})(hterm.Command);
