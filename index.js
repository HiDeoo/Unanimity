/**
 * Unanimity
 */

var fs = require("fs");
var wrench = require("wrench");
var asar = require("asar");

var discordPath;
var importLineNumber;
var functionLineNumber;
var functionCallLineNumber;
var packageLineNumber;

var appIndexPath = "/app/index.js";
var appPackagePath = "/app/package.json";

function init()
{
	install();
}

function install()
{
	if (typeof discordPath == "undefined") {
		var os = process.platform;

		if (os == "darwin") {
			discordPath = "/Applications/Discord.app/Contents/Resources";
			importLineNumber = 84;
			functionLineNumber = 602;
			functionCallLineNumber = 500;
			packageLineNumber = 10;
		} else {
			console.log("Unanimity only supports OS X.");
			process.exit();
		}
	}

	fs.exists(discordPath, function (exists) {
		if (exists) {
			console.log("Discord folder found at " + discordPath + ".");

			var appPath = discordPath + "/node_modules/Unanimity";
			var asarPath = discordPath + "/app.asar";
			var extractedAsarPath = discordPath + "/app";

			if (fs.existsSync(appPath)) {
				console.log("Removing current version of Unanimity.");
				wrench.rmdirSyncRecursive(appPath);
				console.log("Removed current version of Unanimity.");
			}

			if (fs.existsSync(extractedAsarPath)) {
				console.log("Removing old Discord Atom-Shell Archive.");
				wrench.rmdirSyncRecursive(extractedAsarPath);
				console.log("Removed old Discord Atom-Shell Archive.");
			}

			console.log("Installing Unanimity.");
			wrench.copyDirSyncRecursive(__dirname + "/Unanimity/", appPath, {});

			if (fs.existsSync(asarPath)) {
				console.log("Discord Atom-Shell Archive found at " + asarPath + ".");
			} else {
				console.log("Discord Atom-Shell Archive not found at " + asarPath + ".");
				process.exit();
			}

			console.log("Extracting Discord Atom-Shell Archive.");
			asar.extractAll(asarPath, extractedAsarPath);

			fs.exists(extractedAsarPath, function (exists) {
				if (exists) {
					console.log("Discord Atom-Shell Archive extracted at " + extractedAsarPath + ".");

					console.log("Injecting index.js.");

					var data = fs.readFileSync(extractedAsarPath + appIndexPath).toString().split("\n");
					data.splice(importLineNumber, 0, "var unanimity = require('unanimity');\n");
					data.splice(functionCallLineNumber, 0, "\n_unanimity(mainWindow);");
					data.splice(functionLineNumber, 0, "\t\tfunction _unanimity(w) { unanimity = new unanimity.Unanimity(w); unanimity.init(); }\n");

					fs.writeFile(extractedAsarPath + appIndexPath, data.join("\n"), function(err) {
						if (err) {
							console.log("Something went wrong while injecting index.js.");
							return console.log(err);
						}

						console.log("Injected index.js.");
						console.log("Injecting package.json.");

						var data = fs.readFileSync(extractedAsarPath + appPackagePath).toString().split("\n");
						data.splice(packageLineNumber, 0, '\t\t"unanimity": "^0.1.0",');

						fs.writeFile(extractedAsarPath + appPackagePath, data.join("\n"), function(err) {
							if (err) {
								console.log("Something went wrong while injecting package.json.");
								return console.log(err);
							}

							console.log("Injected package.json.");

							console.log("Enjoy.");						
							process.exit();
						});
					});					
				} else {
					console.log("Could not extract Discord Atom-Shell Archive.");
					process.exit();
				}
			});
		} else {
			console.log("Discord folder not found at " + discordPath + ".");
			process.exit();
		}
	});
}

init();