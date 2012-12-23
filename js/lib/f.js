// Copyright (c) 2012 The Chromium OS Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

(function(hterm) {
  /**
   * Grab bag of utility functions.
   */
  var f = {};

  /**
   * Clamp a given integer to a specified range.
   *
   * @param {integer} v The value to be clamped.
   * @param {integer} min The minimum acceptable value.
   * @param {integer} max The maximum acceptable value.
   */
  f.clamp = function(v, min, max) {
    if (v < min) return min;
    if (v > max) return max;
    return v;
  };

  /**
   * Left pad a string to a given length using a given character.
   *
   * @param {string} str The string to pad.
   * @param {integer} length The desired length.
   * @param {string} opt_ch The optional padding character, defaults to ' '.
   * @return {string} The padded string.
   */
  f.lpad = function(str, length, opt_ch) {
    str = String(str);
    opt_ch = opt_ch || ' ';

    while (str.length < length)
      str = opt_ch + str;

    return str;
  };

  /**
   * Left pad a number to a given length with leading zeros.
   *
   * @param {string|integer} number The number to pad.
   * @param {integer} length The desired length.
   * @return {string} The padded number as a string.
   */
  f.zpad = function(number, length) {
    return f.lpad(number, length, '0');
  };

  /**
   * Return a string containing a given number of space characters.
   *
   * This method maintains a static cache of the largest amount of whitespace
   * ever requested.  It shouldn't be used to generate an insanely huge amount of
   * whitespace.
   *
   * @param {integer} length The desired amount of whitespace.
   * @param {string} A string of spaces of the requested length.
   */
  f.getWhitespace = function(length) {
    if (length == 0)
      return '';

    var f = this.getWhitespace;
    if (!f.whitespace)
      f.whitespace = '          ';

    while (length > f.whitespace.length) {
      f.whitespace += f.whitespace;
    }

    return f.whitespace.substr(0, length);
  };

  hterm.f = f;
})(window.hterm);
