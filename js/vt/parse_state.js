(function(VT) {
  'use strict'

  /**
   * ParseState constructor.
   *
   * This object tracks the current state of the parse.  It has fields for the
   * current buffer, position in the buffer, and the parse function.
   *
   * @param {function} defaultFunc The default parser function.
   * @param {string} buf Optional string to use as the current buffer.
   */
  var ParseState = function(defaultFunction, buf) {
    this.defaultFunction = defaultFunction;
    this.buf = buf || null;
    this.pos = 0;
    this.func = defaultFunction;
    this.args = [];
  };

  /**
   * Reset the parser function, buffer, and position.
   */
  ParseState.prototype.reset = function(opt_buf) {
    this.resetParseFunction();
    this.resetBuf(opt_buf || '');
    this.resetArguments();
  };

  /**
   * Reset the parser function only.
   */
  ParseState.prototype.resetParseFunction = function() {
    this.func = this.defaultFunction;
  };

  /**
   * Reset the buffer and position only.
   *
   * @param {string} buf Optional new value for buf, defaults to null.
   */
  ParseState.prototype.resetBuf = function(opt_buf) {
    this.buf = (typeof opt_buf == 'string') ? opt_buf : null;
    this.pos = 0;
  };

  /**
   * Reset the arguments list only.
   *
   * @param {string} opt_arg_zero Optional initial value for args[0].
   */
  ParseState.prototype.resetArguments = function(opt_arg_zero) {
    this.args.length = 0;
    if (typeof opt_arg_zero != 'undefined')
      this.args[0] = opt_arg_zero;
  };

  /**
   * Get an argument as an integer.
   *
   * @param {number} argnum The argument number to retreive.
   */
  ParseState.prototype.iarg = function(argnum, defaultValue) {
    var str = this.args[argnum];
    if (str) {
      var ret = parseInt(str, 10);
      // An argument of zero is treated as the default value.
      if (ret == 0)
        ret = defaultValue;
      return ret;
    }
    return defaultValue;
  };

  /**
   * Advance the parse postion.
   *
   * @param {integer} count The number of bytes to advance.
   */
  ParseState.prototype.advance = function(count) {
    this.pos += count;
  };

  /**
   * Return the remaining portion of the buffer without affecting the parse
   * position.
   *
   * @return {string} The remaining portion of the buffer.
   */
  ParseState.prototype.peekRemainingBuf = function() {
    return this.buf.substr(this.pos);
  };

  /**
   * Return the next single character in the buffer without affecting the parse
   * position.
   *
   * @return {string} The next character in the buffer.
   */
  ParseState.prototype.peekChar = function() {
    return this.buf.substr(this.pos, 1);
  };

  /**
   * Return the next single character in the buffer and advance the parse
   * position one byte.
   *
   * @return {string} The next character in the buffer.
   */
  ParseState.prototype.consumeChar = function() {
    return this.buf.substr(this.pos++, 1);
  };

  /**
   * Return true if the buffer is empty, or the position is past the end.
   */
  ParseState.prototype.isComplete = function() {
    return this.buf == null || this.buf.length <= this.pos;
  };

  VT.ParseState = ParseState;
})(hterm.VT)

