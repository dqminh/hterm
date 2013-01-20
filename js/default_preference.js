(function(hterm) {
  'use strict';

  /**
   * background-color    : The background color for text with no other color attributes.
   * cursor-color        : The color of the visible cursor.
   * font-family         : Default font family for the terminal text.
   * font-size           : The default font size in pixels.
   * font-smoothing      : anti-aliasing
   * foreground-color    : The foreground color for text with no other color attributes.
   * max-string-sequence : Max length of a DCS, OSC, PM, or APS sequence before we give up and ignore the code.
   * environment         : The default environment variables.
   */
  hterm.DefaultPreference = function() {
    return {
      'background-color': 'rgb(16, 16, 16)',
      'cursor-color': 'rgba(255,0,0,0.5)',
      'font-family': ('"DejaVu Sans Mono", "Everson Mono", ' +
          'FreeMono, "Menlo", "Terminal", ' +
          'monospace'),
      'font-size': 15,
      'font-smoothing': 'antialiased',
      'foreground-color': 'rgb(240, 240, 240)',
      'max-string-sequence': 100000,
      'environment': {TERM: 'xterm-256color'},
    }
  };
})(hterm)
