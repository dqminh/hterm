window.onerror = function(message, file, line) {
  if (message == 'Uncaught EXPECTED_EXCEPTION') {
    return true;
  }
  console.log("Uncaught", message, file, line);
  return false;
}
