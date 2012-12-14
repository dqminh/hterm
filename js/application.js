//= require lib
//= require lib_colors
//= require lib_f
//= require lib_utf8
//= require hterm
//= require hterm_default_preference
//= require hterm_options
//= require hterm_keyboard
//= require hterm_keyboard_keymap
//= require hterm_pubsub
//= require hterm_screen
//= require hterm_scrollport
//= require hterm_terminal
//= require hterm_terminal_io
//= require hterm_text_attributes
//= require hterm_vt
//= require hterm_vt_character_map
//= require websocket_command_instance
//= require_self

$(document).ready(function() {
  lib.ensureRuntimeDependencies();
  var terminal = new hterm.Terminal();
  terminal.decorate(document.querySelector('#terminal'));
  terminal.setCursorPosition(0, 0);
    terminal.setCursorVisible(true);
    terminal.runCommandClass(WebsocketCommandInstance,
      document.location.hash.substr(1));
  window.term_ = terminal;
});
