/**
 * Unanimity
 */

var url = require("url");
var http = require("http");
var https = require("https");

var window;

function Discord(w)
{
	window = w;
}

Discord.prototype.getWebContents = function () {
	return window.webContents;
};

Discord.prototype.js = function (js) {
	this.getWebContents().executeJavaScript(js);
};

Discord.prototype.log = function (message) {
	this.js('console.log("' + message + '");');
};

Discord.prototype.injectJS = function (url, notification) {
	this.js('(function () { var script = document.createElement("script"); script.type = "text/javascript"; script.onload = function () { unanimityIPC.send("asynchronous-message", "' + notification + '"); }; script.src = "' + url + '"; document.getElementsByTagName("body")[0].appendChild(script); })();');
};

Discord.prototype.injectCSS = function (url, notification) {
	this.js('function injectCSS () { $("head").append("<link rel=\'stylesheet\' href=\'' + url + '\' type=\'text/css\' />"); } injectCSS();');
	this.sendNotification(notification);
};

Discord.prototype.sendNotification = function (notification) {
	this.js('unanimityIPC.send("asynchronous-message", "' + notification + '");');
};

Discord.prototype.download = function (uri, callback) {
    var protocol = url.parse(uri).protocol;

    if (protocol == "https:") {
        https.get(uri, function (res) {
            var data = "";

            res.on("data", function (d) {
                data += d;
            });

            res.on("end", function () {
                callback(data, res);
            });
        });
    } else if (protocol == "http:") {
        http.get(uri, function (res) {
            var data = "";

            res.on("data", function (d) {
                data += d;
            });

            res.on("end", function () {
                callback(data, res);
            });
        });
    }
};

exports.Discord = Discord;