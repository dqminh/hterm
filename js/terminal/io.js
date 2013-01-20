(function(hterm, Frame, encodeUTF8) {
  'use strict'

  /**
   * Input/Output interface used by commands to communicate with the terminal.
   *
   * Commands like `nassh` and `crosh` receive an instance of this class as
   * part of their argv object.  This allows them to write to and read from the
   * terminal without exposing them to an entire hterm.Terminal instance.
   *
   * The active command must override the onVTKeystroke() and sendString() methods
   * of this class in order to receive keystrokes and send output to the correct
   * destination.
   *
   * Isolating commands from the terminal provides the following benefits:
   * - Provides a mechanism to save and restore onVTKeystroke and sendString
   *   handlers when invoking subcommands (see the push() and pop() methods).
   * - The isolation makes it easier to make changes in Terminal and supporting
   *   classes without affecting commands.
   * - In The Future commands may run in web workers where they would only be able
   *   to talk to a Terminal instance through an IPC mechanism.
   *
   * @param {hterm.Terminal}
   */
  var IO = function(terminal) {
    this.terminal_ = terminal;
    // The IO object to restore on IO.pop().
    this.previousIO_ = null;
  };

  /**
  * Open an frame in the current terminal window, pointed to the specified
  * url.
  *
  * Eventually we'll probably need size/position/decoration options.
  * The user should also be able to move/resize the frame.
  *
  * @param {string} url The URL to load in the frame.
  * @param {Object} opt_options Optional frame options.  Not implemented.
  */
  IO.prototype.createFrame = function(url, opt_options) {
    return new Frame(this.terminal_, url, opt_options);
  };

  /**
  * Change the preference profile for the terminal.
  *
  * @param profileName {string} The name of the preference profile to activate.
  */
  IO.prototype.setTerminalProfile = function(profileName) {
    this.terminal_.setProfile(profileName);
  };

  /**
  * Create a new hterm.Terminal.IO instance and make it active on the Terminal
  * object associated with this instance.
  *
  * This is used to pass control of the terminal IO off to a subcommand.  The
  * IO.pop() method can be used to restore control when the subcommand completes.
  */
  IO.prototype.push = function() {
    var io = new IO(this.terminal_);
    io.keyboardCaptured_ = this.keyboardCaptured_;

    io.previousIO_ = this.terminal_.io;
    this.terminal_.io = io;

    return io;
  };

  /**
  * Restore the Terminal's previous IO object.
  */
  IO.prototype.pop = function() {
    this.terminal_.io = this.previousIO_;
  };

  /**
  * Called when data needs to be sent to the current command.
  *
  * Clients should override this to receive notification of pending data.
  *
  * @param {string} string The data to send.
  */
  IO.prototype.sendString = function(string) {
    // Override this.
    console.log('Unhandled sendString: ' + string);
  };

  /**
  * Called when a terminal keystroke is detected.
  *
  * Clients should override this to receive notification of keystrokes.
  *
  * @param {string} string The VT key sequence.
  */
  IO.prototype.onVTKeystroke = function(string) {
    // Override this.
    console.log('Unobserverd VT keystroke: ' + JSON.stringify(string));
  };

  /**
  * Called when terminal size is changed.
  *
  * Clients should override this to receive notification of resize.
  *
  * @param {string|integer} terminal width.
  * @param {string|integer} terminal height.
  */
  IO.prototype.onTerminalResize = function(width, height) {
    // Override this.
  };

  /**
  * Write a UTF-8 encoded byte string to the terminal.
  *
  * @param {string} string The UTF-8 encoded string to print.
  */
  IO.prototype.writeUTF8 = function(string) {
    if (this.terminal_.io != this)
      throw 'Attempt to print from inactive IO object.';

    this.terminal_.interpret(string);
  };

  /**
  * Write a UTF-8 encoded byte string to the terminal followed by crlf.
  *
  * @param {string} string The UTF-8 encoded string to print.
  */
  IO.prototype.writelnUTF8 = function(string) {
    if (this.terminal_.io != this)
      throw 'Attempt to print from inactive IO object.';

    this.terminal_.interpret(string + '\r\n');
  };

  /**
  * Write a UTF-16 JavaScript string to the terminal.
  *
  * @param {string} string The string to print.
  */
  IO.prototype.print =
  IO.prototype.writeUTF16 = function(string) {
    this.writeUTF8(encodeUTF8(string));
  };

  /**
  * Print a UTF-16 JavaScript string to the terminal followed by a newline.
  *
  * @param {string} string The string to print.
  */
  IO.prototype.println =
  IO.prototype.writelnUTF16 = function(string) {
    this.writelnUTF8(encodeUTF8(string));
  };

  hterm.TerminalIO = IO;
})(hterm, hterm.Frame, hterm.encodeUTF8);
