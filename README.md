# phantom-event-stream

A wrapper to interface with phantomjs as a node event stream.

Event are emitted from the browser context and forwarded to the node interface.

This helper will take care of many thing for you in order to get it right asap and let you manage your business instead of fighting with some details.

## Install

```sh
    npm i -g maboiteaspam/phantom-event-stream
```

## Usage

You ll get to declare
- a file for node, to consume the stream,
- a file for the browser to emit events,
- and probably a phantomjs file to control in between node and browser

__node stream__

Should look likes this, more or less.

```js

var phantomStream = require('phantom-event-stream');

var opts = {
  main: __dirname + '/phantom-main.js',
  url: 'https://www.some.com/',
  size: '800x600',
  scripts: [ // to inject in brower context
    __dirname + '/browser.js'
  ]
};

                                                        // its your duty to create a webserver.
phantomStream(opts.url, opts.size, opts)

  .on('savethis', function (b){                         // this is an event sent from phantom context
    b = JSON.parse(b)
    console.log(b);

    fs.writeFileSync(file, new Buffer(b.img, 'base64'))
  }).on('screenthis', function (d){                     // this is an event sent from page context
    debug('screenthis : '+d)

  }).on('token', function (d){                          // this is an event sent from page context
    debug('token : '+d)

  }).on('data', function (d){                           // this is regualr data / error / end event
    /* !!! for some reasons,
     it is required to bind data
      to receive end event */
    console.log('PAGE IS TALKING : '+d)

  }).on('warn', function (d){                           // specific to phantom-event-stream
                                                        // to separate page errors from node errors
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

__browser interface__
```js
var myStuff = {                                                         // some class of yours.
  doSomeStuff: function () {
    window.phantomSpeaker                                               // this is a global object injected by
                                                                        // phantom-stream-events.
                                                                        // Use it to speak to node/phantom processes.
        .emit('screenthis', {data:to, share:with_node});

    window.phantomSpeaker.emit('savethis', {data:to, share:with_node});
    window.phantomSpeaker.emit('token', {data:to, share:with_node});
  }
};

myStuff.doSomeStuff();
```

__phantom interface__

Should look likes this, more or less.

```js

/* global phantom,document,window,btoa */
'use strict';
var system = require('system');
var opts = JSON.parse(system.args[1]);
var Page = require('phantom-helper/phantom-main').Page; // The helper to event from the browser to node,
                                                        // with phantom in between.

var pageHelper = new Page(phantom, opts);               // make a new helper instance
var page = pageHelper.page;                             // get the regular phantomJS page object.

pageHelper.onMessage = function (event, msg) {
  if(event==='eventID') {                               // those are events sent from the browser.
    console.log(msg)                                    // do some stuff
                                                        // you can't cancel event, but you can transform,
                                                        // then emit a new event.
  }
};

pageHelper.open(opts.url, function () {         // open the page, regular phantomjs practice

  setInterval(function () {
    phantom.exit();                             // up to you.
  }, 2 * 1000);

});
```

## Options

__url__

    Url to call in phantomjs

__size__

    Size of the screen before any processing

__cookies__

    JSON object of cookies.

__delay__

    Delay in seconds before processing starts.

__scale__

    Scaling of the page between 0->1.

__main__

    The path to the main script to run with phantomjs.

__scripts__

    An array of JS files to inject into the browser context.



## Examples

See https://github.com/maboiteaspam/screenshot-stream-selected for an example.

This work was heavily inspired by https://github.com/kevva/screenshot-stream
