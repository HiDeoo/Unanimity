/**
 * Unanimity
 */

var observer;

var mutePlugin;
var searchPlugin;

function Core () {}

Core.prototype.init = function () {
	mutePlugin = new MutePlugin();
    searchPlugin = new SearchPlugin();

	this.initObserver();
};

Core.prototype.initObserver = function () {
	observer = new MutationObserver(function (mutations) {
		mutations.forEach(function(mutation) {
			if(mutation.target.getAttribute("class") && mutation.target.getAttribute("class")  != '' && mutation.target.getAttribute("class").indexOf("titlebar") != -1) {
				mutePlugin.didMutate();
                searchPlugin.didMutate();
			}
		});
	});

    var config = { childList: true, subtree: true };

	//noinspection JSCheckFunctionSignatures
    observer.observe(document, config);
};