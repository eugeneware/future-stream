# future-stream

Delay the emission of stream events until a future condition is true

[![build status](https://secure.travis-ci.org/eugeneware/future-stream.png)](http://travis-ci.org/eugeneware/future-stream)

## Installation

This module is installed via npm:

``` bash
$ npm install future-stream
```

## Example Usage

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
