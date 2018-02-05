'use strict';
const fs = require('fs');
const path = require('path');
const urlMod = require('url');
const base64Stream = require('base64-stream');
const parseCookiePhantomjs = require('parse-cookie-phantomjs');

const byline = require('byline');

var spawn = require('child_process').spawn;


var bridge = function (file, args) {

    if (process.platform == "linux") {
        var phantomjs = path.join(__dirname, "./bin/linux/phantomjs")
    }
    else {
        var phantomjs = path.join(__dirname, "./bin/phantomjs")
    }


    args = [path.resolve(file)].concat(args).sort(function (a, b) {
        // move flags to the beginning to please phantoms sucky argument parsing
        return /^--/.test(b) ? 1 : 0;
    });

    return spawn(phantomjs, args);
};


var opts = Object.assign({
    delay: 0,
    scale: 1,
    format: 'png'
}, opts);

const args = Object.assign(opts, {


});

const cp = bridge(path.join(__dirname, 'img.js'), [

    JSON.stringify(args)
]);

cp.stdout.on('data', function (data)  {
    console.log("stdout:" +data);
});

cp.stderr.on('data', function (data)  {
    console.log("stdout:" +data)
});

cp.on('close',function (code)  {
    console.log('child process exited with code '+code)
});
