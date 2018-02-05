var page = require('webpage').create();
var url = 'http://localhost:8085/designer/source/template/2'
// var url = 'http://www.baidu.com'
page.onError = function (err, trace) {
    err = err.replace(/\n/g, '');
    console.error('PHANTOM ERROR: ' + err + formatTrace(trace[0]));
    phantom.exit(1);
};


page.onResourceError = function (resourceError) {
    console.error('WARN: Unable to load resource #' + resourceError.id + ' (' + resourceError.errorString + ') → ' + resourceError.url);
};

page.onResourceTimeout = function (resourceTimeout) {
    console.error('Resource timed out #' + resourceTimeout.id + ' (' + resourceTimeout.errorString + ') → ' + resourceTimeout.url);
    phantom.exit(1);
};
page.open(url, function(status) {

    if (status !== 'success') {
        console.log('Unable to access network');
    } else {
        var ua = page.evaluate(function() {
            return document.body.innerHTML;
        });
        console.log(ua);

        window.setTimeout(function ()
        {
            console.log("render is ok")
            page.render('github.png');
            phantom.exit();
        },5*1000);


    }


});