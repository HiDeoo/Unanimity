/**
 * Unanimity
 */

var discord = require("./discord");
var ipc = require("ipc");
var package = require("../package.json");

var window;
var unanimityUrl = "https://verre2vin.info/unanimity/assets";

function Unanimity(w) 
{
	window = w;
}

Unanimity.prototype.init = function () {
	discord = new discord.Discord(window);

	this.start();
};

Unanimity.prototype.start = function () {
	var self = this;

	discord.getWebContents().on("dom-ready",  function () {
        discord.download("https://raw.githubusercontent.com/HiDeoo/Unanimity/master/package.json", function (data, res) {
            var packageJson = JSON.parse(data);

            if (res.statusCode == 200) {
                var latest = packageJson.version;

                if (package.version < latest) {
                    discord.js('alert("A new version of Uninamity is available.\\nCurrent version: ' + package.version + '\\nNew version: ' + latest + '");');
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
        			discord.injectJS(unanimityUrl + "/js/core.js?" + (new Date).getTime(), "un-injected-core");
        			break;
                case "un-injected-core":
                    self.updateLoader("UNANIMITY - INJECTING KEYBOARD SHORTCUTS", 40);
                    discord.injectJS(unanimityUrl + "/js/jquery.hotkeys.js?" + (new Date).getTime(), "un-injected-keyboard");
                    break;
        		case "un-injected-keyboard":
        			self.updateLoader("UNANIMITY - INJECTING UI PLUGIN", 50);
        			discord.injectJS(unanimityUrl + "/js/ui.js?" + (new Date).getTime(), "un-injected-ui");
        			break;
        		case "un-injected-ui":
        			self.updateLoader("UNANIMITY - INJECTING SEARCH PLUGIN", 60);
        			discord.injectJS(unanimityUrl + "/js/search.js?" + (new Date).getTime(), "un-injected-search");
        			break;
        		case "un-injected-search":
        			self.updateLoader("UNANIMITY - INJECTING MUTE PLUGIN", 70);
        			discord.injectJS(unanimityUrl + "/js/mute.js?" + (new Date).getTime(), "un-injected-mute");
        			break;
        		case "un-injected-mute":
        			self.updateLoader("UNANIMITY - INJECTING CSS", 80);
        			discord.injectCSS(unanimityUrl + "/css/main.css?" + (new Date).getTime(), "un-injected-css");
        			break;
        		case "un-injected-css":
        			discord.sendNotification("un-starting");
        			break;
        		case "un-starting":
        			self.updateLoader("UNANIMITY - BREWING COFFEE", 90);

        			discord.js('var core = new Core(); core.init();');

        			self.updateLoader("UNANIMITY - HERE WE GO!", 100);

        			setTimeout(function() {
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

exports.Unanimity = Unanimity;