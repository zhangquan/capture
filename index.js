'use strict';
const fs = require('fs');
const path = require('path');
const urlMod = require('url');
const base64Stream = require('base64-stream');
const parseCookiePhantomjs = require('parse-cookie-phantomjs');

const byline = require('byline');

 var spawn = require('child_process').spawn;


var bridge =  function (file, args) {

    if(process.platform == "linux"){
        var phantomjs = path.join(__dirname, "./bin/linux/phantomjs")
    }
    else{
        var phantomjs = path.join(__dirname, "./bin/phantomjs")
    }




    args = [path.resolve(file)].concat(args).sort(function (a, b) {
        // move flags to the beginning to please phantoms sucky argument parsing
        return /^--/.test(b) ? 1 : 0;
    });

    return spawn(phantomjs, args);
};



module.exports = function(url, size, opts) {
    var opts = Object.assign({
        delay: 0,
        scale: 1,
        format: 'png'
    }, opts);

    const args = Object.assign(opts, {
        url:url,
        width: size.split(/x/i)[0] * opts.scale,
        height: size.split(/x/i)[1] * opts.scale,
        format: opts.format === 'jpg' ? 'jpeg' : opts.format
    });

    const cp = bridge(path.join(__dirname, 'stream.js'), [
        '--ignore-ssl-errors=true',
        '--local-to-remote-url-access=true',
        '--ssl-protocol=any',
        JSON.stringify(args)
    ]);

    const stream = base64Stream.decode();

    process.stderr.setMaxListeners(0);

    cp.stderr.setEncoding('utf8');
    cp.stdout.pipe(stream);

    byline(cp.stderr).on('data', function(data){
        data = data.trim();

    if (/ phantomjs\[/.test(data)) {
        return;
    }

    if (/http:\/\/requirejs.org\/docs\/errors.html#mismatch/.test(data)) {
        return;
    }

    if (data.startsWith('WARN: ')) {
        stream.emit('warning', data.replace(/^WARN: /, ''));
        stream.emit('warn', data.replace(/^WARN: /, '')); // TODO: deprecate this event in v5
        return;
    }

    if (data.length > 0) {
        const err = new Error(data);
        err.noStack = true;
        cp.stdout.unpipe(stream);
        stream.emit('error', err);
    }
});

    return stream;
};