'use strict';
var debug = require('debug')('phantom-event-stream');
var path = require('path');
var urlMod = require('url');
var parseCookiePhantomjs = require('parse-cookie-phantomjs');
var phantomBridge = require('phantom-bridge');
var objectAssign = require('object-assign');
var byline = require('byline');

function handleCookies(cookies, url) {
  var parsedUrl = urlMod.parse(url);

  return (cookies || []).map(function (cookie) {
    var ret = typeof cookie === 'string' ? parseCookiePhantomjs(cookie) : cookie;

    if (!ret.domain) {
      ret.domain = parsedUrl.hostname;
    }

    if (!ret.path) {
      ret.path = parsedUrl.path;
    }

    return ret;
  });
}

module.exports = function (url, size, opts) {
  opts = objectAssign({
    delay: 0,
    scale: 1
  }, opts);

  opts.url      = url;
  opts.width    = size.split(/x/i)[0] * opts.scale;
  opts.height   = size.split(/x/i)[1] * opts.scale;
  opts.cookies  = handleCookies(opts.cookies, opts.url);
  opts.token    = 'speaker-token-' + (new Date().getTime());
  opts.main     = opts.main || path.join(__dirname, 'phantom-main.js');
  opts.scripts  = opts.scripts || [];
  opts.scripts.unshift(__dirname+'/public/phantom-speaker.js');

  var cp = phantomBridge(opts.main, [
    '--ignore-ssl-errors=true',
    '--local-to-remote-url-access=true',
    '--ssl-protocol=any',
    JSON.stringify(opts)
  ]);

  process.stderr.setMaxListeners(0);

  var stream = cp.stdout;

  cp.stdout.setEncoding('utf8');
  cp.stderr.setEncoding('utf8');

  stream = byline(stream);

  stream.on('data', function (data) {
    data = data.trim();

    if(data.substr(0, opts.token.length)===opts.token) {
      var msg = data.substr(opts.token.length)
      msg = msg.split(':')
      stream.emit(msg.shift().toLowerCase(), msg.join(':'));
    }

  });

  byline(cp.stderr).on('data', function (data) {
    data = data.trim();

    if(data.substr(0, opts.token.length)===opts.token) {
      var msg = data.substr(opts.token.length)
      msg = msg.split(':')
      stream.emit(msg.shift().toLowerCase(), msg.join(':'));
    } else {
      stream.emit('data', data) // re emit stderr on stream (of stdout).
    }

  }).on('end', function () {
    debug(opts)
  });

  return stream;
};