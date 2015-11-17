/**
 * Unanimity
 */

var discord = require("./discord");
var ipc = require("ipc");
var url = require("url");
var http = require("http");
var https = require("https");
var localPackage = require("../package.json");

var repoApiUrl = "https://api.github.com/repos/HiDeoo/Unanimity/commits/master";
var unanimityUrl = "https://cdn.rawgit.com/HiDeoo/Unanimity";

var window;
var latestCommit;

function Unanimity(w) {
    window = w;
}

Unanimity.prototype.init = function () {
    var self = this;

    discord = new discord.Discord(window);

    self.getLatestCommit(function (error) {
        if (!error) {
            unanimityUrl += "/" + latestCommit + "/plugins";

            self.start();
        } else {
            discord.js('alert("Unanimity encountered an error while loading some plugins.\\nPlease try again later.");');
        }
    });
};

Unanimity.prototype.start = function () {
    var self = this;

    discord.getWebContents().on("dom-ready", function () {
        self.download("https://raw.githubusercontent.com/HiDeoo/Unanimity/master/package.json", function (data, res) {
            var remotePackage = JSON.parse(data);

            if (res.statusCode == 200) {
                var latest = remotePackage.version;

                if (localPackage.version < latest) {
                    discord.js('alert("A new version of Uninamity is available.\\nCurrent version: ' + localPackage.version + '\\nNew version: ' + latest + '");');
                    discord.js('window.open("https://github.com/HiDeoo/Unanimity/releases", "_blank");');
                }
            }
        });

        discord.js('var loadingElement = document.createElement("div");');
        discord.js('loadingElement.innerHTML = \'<style>#un-loadingBar { margin-left: 10px; -webkit-appearance: none; height: 7px; border-radius: 3px; vertical-align: 1px; } #un-loadingBar::-webkit-progress-bar { background-color: #1e2124; border-radius: 3px; } #un-loadingBar::-webkit-progress-value { background-color: #616365; border-radius: 3px; }</style><div style="width: 100%; height: 30px; background-color: #2f3136; border-top: 1px solid #16181a; color: #696b6e; font-family: Whitney, Helvetica, Arial, sans-serif; font-size: 12px; font-style: normal; font-weight: 600; line-height: 30px;" id="un-loadingWrapper"><div style="padding-right: 15px; float: right;"><span id="un-loadingMessage">STARTING UP UNANIMITY</span> <progress id="un-loadingBar" value="50" max="100"></progress></div></div>\'');
        discord.js('var app = document.getElementsByClassName("flex-vertical flex-spacer")[0]; app.appendChild(loadingElement);');

        discord.js('var unanimityIPC = require("ipc");');

        ipc.on("asynchronous-message", function (event, arg) {
            switch (arg) {
                case "un-injected-jquery":
                    self.updateLoader("UNANIMITY - INJECTING CORE", 30);
                    discord.injectJS(unanimityUrl + "/js/core.js", "un-injected-core");
                    break;
                case "un-injected-core":
                    self.updateLoader("UNANIMITY - INJECTING KEYBOARD SHORTCUTS", 40);
                    discord.injectJS("https://cdn.rawgit.com/jeresig/jquery.hotkeys/master/jquery.hotkeys.js", "un-injected-keyboard");
                    break;
                case "un-injected-keyboard":
                    self.updateLoader("UNANIMITY - INJECTING UI PLUGIN", 50);
                    discord.injectJS(unanimityUrl + "/js/ui.js", "un-injected-ui");
                    break;
                case "un-injected-ui":
                    self.updateLoader("UNANIMITY - INJECTING SEARCH PLUGIN", 60);
                    discord.injectJS(unanimityUrl + "/js/search.js", "un-injected-search");
                    break;
                case "un-injected-search":
                    self.updateLoader("UNANIMITY - INJECTING MUTE PLUGIN", 70);
                    discord.injectJS(unanimityUrl + "/js/mute.js", "un-injected-mute");
                    break;
                case "un-injected-mute":
                    self.updateLoader("UNANIMITY - INJECTING CSS", 80);
                    discord.injectCSS(unanimityUrl + "/css/main.css", "un-injected-css");
                    break;
                case "un-injected-css":
                    discord.sendNotification("un-starting");
                    break;
                case "un-starting":
                    self.updateLoader("UNANIMITY - BREWING COFFEE", 90);

                    discord.js('var core = new Core(); core.init();');

                    self.updateLoader("UNANIMITY - HERE WE GO!", 100);

                    setTimeout(function () {
                        discord.js('$("#un-loadingWrapper").hide();');
                    }, 2000);
                    break;
                default:
                    break;
            }
        });

        self.updateLoader("UNANIMITY - INJECTING JQUERY", 20);
        discord.injectJS("//ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js", "un-injected-jquery");
    });
};

Unanimity.prototype.updateLoader = function (message, progress) {
    discord.js('document.getElementById("un-loadingMessage").innerHTML = "' + message + '";');
    discord.js('document.getElementById("un-loadingBar").value = ' + progress + ';');
};

Unanimity.prototype.download = function (options, callback) {
    var protocol;

    if (typeof options === "string") {
        protocol = url.parse(options).protocol;
    } else {
        protocol = options.protocol;
    }

    if (protocol == "https:") {
        https.get(options, function (res) {
            var data = "";

            res.on("data", function (d) {
                data += d;
            });

            res.on("end", function () {
                callback(data, res);
            });
        });
    } else if (protocol == "http:") {
        http.get(options, function (res) {
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

Unanimity.prototype.getLatestCommit = function (callback) {
    var uri = url.parse(repoApiUrl);

    var options = {
        protocol: uri.protocol,
        hostname: uri.hostname,
        port: uri.port,
        path: uri.path,
        headers: {
            'User-Agent': "Unanimity"
        }
    };

    this.download(options, function (data, res) {
        var infos = JSON.parse(data);

        if (res.statusCode == 200) {
            //noinspection JSUnresolvedVariable
            latestCommit = infos.sha;

            callback(false);
        } else {
            callback(true);
        }
    });
};

exports.Unanimity = Unanimity;