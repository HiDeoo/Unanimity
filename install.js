/**
 * Unanimity
 */

var fs = require("fs");
var process = require("process");
var wrench = require("wrench");
var asar = require("asar");

var discordPath;
var importLineNumber;
var functionLineNumber;
var functionCallLineNumber;
var packageLineNumber;

var appIndexPath = "/app/index.js";
var appPackagePath = "/app/package.json";

function exit()
{
    process.exit();
}

/*
 type 0: message
 type 1: error
 */
function log(message, type)
{
    document.getElementById("logs").innerHTML = message;

    if (type == 0) {
        document.getElementById("logs").className = "message";
    } else if (type == 1) {
        document.getElementById("logs").className = "error";
        document.getElementById("exitButton").disabled = false;
    }
}

function install()
{
    document.getElementById("installButton").disabled = true;
    document.getElementById("exitButton").disabled = true;

    if (typeof discordPath == "undefined") {
		var os = process.platform;

		if (os == "darwin") {
			discordPath = "/Applications/Discord.app/Contents/Resources";
			importLineNumber = 84;
			functionLineNumber = 602;
			functionCallLineNumber = 500;
			packageLineNumber = 10;
		} else {
			log("Unanimity only supports OS X.", 1);
		}
	}

	fs.exists(discordPath, function (exists) {
		if (exists) {
			log("Discord folder found at " + discordPath + ".", 0);

			var appPath = discordPath + "/node_modules/Unanimity";
			var asarPath = discordPath + "/app.asar";
			var extractedAsarPath = discordPath + "/app";

			if (fs.existsSync(appPath)) {
				log("Removing current version of Unanimity.", 0);
				wrench.rmdirSyncRecursive(appPath);
				log("Removed current version of Unanimity.", 0);
			}

			if (fs.existsSync(extractedAsarPath)) {
				log("Removing old Discord Atom-Shell Archive.", 0);
				wrench.rmdirSyncRecursive(extractedAsarPath);
				log("Removed old Discord Atom-Shell Archive.", 0);
			}

			log("Installing Unanimity.", 0);
			wrench.copyDirSyncRecursive(process.cwd() + "/Unanimity/", appPath, {});

			if (fs.existsSync(asarPath)) {
				log("Discord Atom-Shell Archive found at " + asarPath + ".", 0);
			} else {
				log("Discord Atom-Shell Archive not found at " + asarPath + ".", 1);
			}

			log("Extracting Discord Atom-Shell Archive.", 0);
			asar.extractAll(asarPath, extractedAsarPath);

			fs.exists(extractedAsarPath, function (exists) {
				if (exists) {
					log("Discord Atom-Shell Archive extracted at " + extractedAsarPath + ".", 0);

					log("Injecting index.js.", 0);

					var data = fs.readFileSync(extractedAsarPath + appIndexPath).toString().split("\n");
					data.splice(importLineNumber, 0, "var unanimity = require('unanimity');\n");
					data.splice(functionCallLineNumber, 0, "\n_unanimity(mainWindow);");
					data.splice(functionLineNumber, 0, "\t\tfunction _unanimity(w) { unanimity = new unanimity.Unanimity(w); unanimity.init(); }\n");

					fs.writeFile(extractedAsarPath + appIndexPath, data.join("\n"), function(err) {
						if (err) {
							log("Something went wrong while injecting index.js.", 1);
							return;
						}

						log("Injected index.js.", 0);
						log("Injecting package.json.", 0);

						var data = fs.readFileSync(extractedAsarPath + appPackagePath).toString().split("\n");
						data.splice(packageLineNumber, 0, '\t\t"unanimity": "^0.1.0",');

						fs.writeFile(extractedAsarPath + appPackagePath, data.join("\n"), function(err) {
							if (err) {
								log("Something went wrong while injecting package.json.", 1);
								return;
							}

							log("Injected package.json.", 0);

							log("Enjoy.", 0);

                            document.getElementById("exitButton").disabled = false;
						});
					});					
				} else {
					log("Could not extract Discord Atom-Shell Archive.", 1);
				}
			});
		} else {
			log("Discord folder not found at " + discordPath + ".", 1);
		}
	});
}