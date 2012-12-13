//= require hterm
//= require keyboard
//= require preference_manager
//= require options
//= require colors
//= require default_keymap
//= require pubsub
//= require screen
//= require scrollport
//= require terminal
//= require terminal_io
//= require text_attributes
//= require vt
//= require websocket_command_instance
//= require_self

$(document).ready(function() {
  var terminal = new hterm.Terminal();
  terminal.decorate(document.querySelector('#terminal'));
  // TODO: onTerminalReady ??
  terminal.setCursorPosition(0, 0);
  terminal.setCursorVisible(true);
  terminal.runCommandClass(WebsocketCommandInstance,
    document.location.hash.substr(1));
  window.term_ = terminal;
});
