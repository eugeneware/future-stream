var futureStream = require('./index');
var fs = require('fs');

function makeStream() {
  return fs.createReadStream('/etc/passwd', { encoding: 'utf8' });
}

var start = Date.now();
function condition() {
  // true after 1 second
  return (Date.now() - start) > 1000;
}

var s = futureStream(makeStream, condition);
s.pipe(process.stdout);
