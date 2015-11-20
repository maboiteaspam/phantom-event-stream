/* global phantom,document,window,btoa */
'use strict';
var system = require('system');
var Page = require('./phantom-helper').Page;
var opts = JSON.parse(system.args[1]);

var pageHelper = new Page(phantom, opts)
var page = pageHelper.page;

pageHelper.open(opts.url, function () {

  setInterval(function () {
    phantom.exit();
  }, 2 * 1000);

});