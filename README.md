# phantom-event-stream

A wrapper to interface with phantomjs as a node event stream.

Event are emitted from the browser context and forwarded to the node interface.

This helper will take care of many thing for you in order to get it right asap and let you manage your business instead of fighting with some details.

## Install

```sh
    npm i -g maboiteaspam/phantom-event-stream
```

## Usage

You ll get to declare a file for node, to consume the stream, and a file for the browser to emit events, and probably a file in the view to send some events.

__node stream__ Should look likes this, more or less.

```js
var phantomStream = require('phantom-event-stream');

phantomStream(opts.url, opts.size, opts)

  .on('savethis', function (b){ // this is an event sent from page context
    b = JSON.parse(b)
    debug('got '+b.file+' picture length (b64) '+ b.img.length)
    var file = path.join(opts.output, b.file);
    var d = path.dirname(file);
    if (fs.existsSync(d)===false) fs.mkdirSync(d)

    fs.writeFileSync(file, new Buffer(b.img, 'base64'))
  }).on('screenthis', function (d){ // this is an event sent from page context
    debug('screenthis : '+d)

  }).on('token', function (d){ // this is an event sent from page context
    debug('token : '+d)

  }).on('data', function (d){ // this is regualr data / error / end event
    /* !!! for some reasons, it is required to bind data to receive end event */
    console.log('PAGE IS TALKING : '+d)

  }).on('warn', function (d){ // specific to this implementation to separate page errors from node errors
    console.error('Got warning !!')
    console.error(d)

  }).on('error', function (d){
    console.error('Got error !!')
    console.error(d)

  }).on('end', function (){
    console.log('All done !!')
    server.close();
  })
```

__phantom interface__ Should look likes this, more or less.

```js
/* global phantom,document,window,btoa */
'use strict';
var system = require('system');
var Page = require('phantom-helper/phantom-main').Page; // this path needs to be checked
var opts = JSON.parse(system.args[1]);

var pageHelper = new Page(phantom, opts)
var page = pageHelper.page;

pageHelper.onMessage = function (event, msg) {
  if(event==='message sent from the browser') { // regarding previous example this should be screenthis, savethis, token
    // do some stuff
  }
};

pageHelper.open(opts.url, function () {

  setInterval(function () {
    phantom.exit(); // up to you.
  }, 2 * 1000);

});
```

__browser interface__
```js
var myStuff = {
  doSomeStuff: function () {
    window.phantomSpeaker // this is a global object injected by phantom-stream-events to speak to node/phantom processes
        .emit('EVENT', {data:to, share:with_node});
  }
};

myStuff.doSomeStuff();
```

## Examples

See https://github.com/maboiteaspam/screenshot-stream-selected for an example.

This work was heavily inspired by https://github.com/kevva/screenshot-stream
