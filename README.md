# Unanimity

Unanimity add [features](#features) to Discord.

## Installation

You can download the latest version of our basic installer (using [NW.js](https://github.com/nwjs/nw.js)) on the [releases page](https://github.com/HiDeoo/Unanimity/releases).

* *OS X: Exit Discord, extract and launch Unanimity.app.*
* *Windows: Exit Discord, extract and launch Unanimity.exe.*

## Development

Unanimity is a basic Node module with only one goal: inject remote files (Javascript or CSS) in Discord at each launch.

Unanimity plugins are Javascript files which will be injected remotely (from GitHub using https) in Discord during startup. JQuery 2.0.3 is automatically injected (first injection) and available right after.

Plugins files are located in the `plugins/js` folder. Additionally, CSS rules are loaded from `plugins/css/main.css`.

The injection sequence can be modified or extended to add more plugins in the `Unanimity/lib/Unanimity.js` file and in the `start()` method. This sequence rely on Inter-process Communication (IPC) asynchronous messages to provide a non-blocking loading process.

To avoid running the installer at each modification or if you don't have `NW.js` installed locally, use the following command:

```Bash
$ node install.js install
```

Plugins requiring a way to react to changes in the DOM (for instance to check if a specific element or view is visible / selected like private messages or the global chat view) are declared in `plugins/js/core.js` and need to implement a `didMutate()` method.
When a valid mutation is detected, a call to the plugin is made via the `didMutate()` method.

Support for keyboard shortcuts is provided using [jQuery.Hotkeys](https://github.com/jeresig/jquery.hotkeys). For example:

```javascript
$(document).bind("keydown", "ctrl+f", function () {
	// Code goes here.
});
```

## Features

* Interface overhaul.
* Search (local only, no API at this time) with keyboard support *(cmd+f, ctrl+f, cmd+g, ctrl+g, cmd+shift+g, ctrl+shift+g, enter, shift+enter)*.
* Mute / unmute all text channels button.

## Planned features

* ~~Unanimity update mechanism (notification).~~
* ~~Plugins hosting directly on Github instead of a private server.~~
* Settings panel to select which features are enabled or not.
* Remove / hide messages.

## Copyright and license

Copyright (c) 2015 HiDeoo. Code released under the [MIT license](https://github.com/HiDeoo/Unanimity/blob/master/LICENSE.md). 