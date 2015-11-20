/**
 * Unanimity
 */

var window;

function Discord(w) {
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
    this.js('(function () { var script = document.createElement("script"); script.type = "text/javascript"; script.onload = function () { unanimityIPC.send("un-ipc-injection", "' + notification + '"); }; script.src = "' + url + '"; document.getElementsByTagName("body")[0].appendChild(script); })();');
};

Discord.prototype.injectCSS = function (url, notification) {
    this.js('function injectCSS () { $("head").append("<link rel=\'stylesheet\' href=\'' + url + '\' type=\'text/css\' />"); } injectCSS();');
    this.sendNotification("un-ipc-injection", notification);
};

Discord.prototype.sendNotification = function (channel, notification) {
    this.js('unanimityIPC.send("' + channel + '", "' + notification + '");');
};

exports.Discord = Discord;