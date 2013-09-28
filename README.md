# future-stream

Delay the emission of stream events until a future condition is true

[![build status](https://secure.travis-ci.org/eugeneware/future-stream.png)](http://travis-ci.org/eugeneware/future-stream)

## Installation

This module is installed via npm:

``` bash
$ npm install future-stream
```

## Example Usage

### futureStream.read

This example delays the streaming of a file to stdout by 1 second.

``` js
var futureStream = require('future-stream');
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
```

### futureStream.write

This example delays the writing to a file by 1 second

``` js
var futureStream = require('future-stream');
var fs = require('fs');

function makeStream() {
  return fs.createWriteStream('/tmp/junk', { encoding: 'utf8' });
}

var start = Date.now();
function condition(data) {
  // true after 1 second
  return (Date.now() - start) > 1000;
}

var s = futureStream.write(makeStream, condition);
// these writes won't be written for 1 second
s.write('hello ');
s.write('world');
s.end();
```

NB: The condition function for writes also will pass in the data being
written allowing you to delay writes for specific data items.

For example:

``` js
var futureStream = require('future-stream');
var fs = require('fs');

function makeStream() {
  return fs.createWriteStream('/tmp/junk', { encoding: 'utf8' });
}

var start = Date.now();
function condition(data) {
  // when data is 'delay', delay the write for one second
  if (data == 'delay') {
    return (Date.now() - start) > 1000;
  } else {
    return true;
  }
}

var s = futureStream.write(makeStream, condition);
s.write('delay');
s.write('not delayed');
s.end();
```
