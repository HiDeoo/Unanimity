/**
 * Unanimity
 */

var observer;
var defaultSettings;

var mutePlugin;
var searchPlugin;

function Core() {
    defaultSettings = {
        unPluginUIEnabled: true,
        unPluginSearchEnabled: true,
        unPluginMuteEnabled: true

    }
}

Core.prototype.init = function () {
    if (this.getSetting("unPluginSearchEnabled")) {
        searchPlugin = new SearchPlugin();
    }

    if (this.getSetting("unPluginMuteEnabled")) {
        mutePlugin = new MutePlugin();
    }

    this.initObserver();
};

Core.prototype.initObserver = function () {
    var self = this;

    observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.target.getAttribute("class") && mutation.target.getAttribute("class") != '') {
                self.didMutate();

                if (mutation.target.getAttribute("class").indexOf("titlebar") != -1) {
                    if (self.getSetting("unPluginSearchEnabled")) {
                        searchPlugin.didMutate();
                    }

                    if (self.getSetting("unPluginMuteEnabled")) {
                        mutePlugin.didMutate();
                    }
                }
            }
        });
    });

    var config = {childList: true, subtree: true};

    //noinspection JSCheckFunctionSignatures
    observer.observe(document, config);
};

Core.prototype.getSetting = function (key) {
    var setting = localStorage.getItem(key);

    if (setting == null && defaultSettings[key] !== "undefined") {
        return defaultSettings[key];
    } else {
        if (setting == "true") {
            setting = true;
        } else if (setting == "false") {
            setting = false;
        }
    }

    return setting;
};

Core.prototype.ipcGetSetting = function (key) {
    unanimityIPC.send("un-ipc-setting", key, this.getSetting(key));
};

Core.prototype.didMutate = function () {
    var self = this;

    var settings = $("form.settings");

    if (!settings || settings.length == 0) {
        return;
    }

    var tabBarItem = $("#un-settingBarItem");

    if (!tabBarItem || tabBarItem.length == 0) {
        tabBarItem = $("<div/>", {id: "un-settingBarItem", class: "tab-bar-item"}).html("Unanimity");

        settings.find(".tab-bar").first().append(tabBarItem);

        settings.find(".tab-bar-item").on("click", function () {
            tabBarItem.removeClass("selected");

            var wrapper = $("#un-settingsWrapper");

            if (wrapper && wrapper.length > 0) {
                wrapper.remove();

                $(".settings-wrapper").show();
            }
        });

        tabBarItem.on("click", function () {
            settings.find(".tab-bar-item").removeClass("selected");
            tabBarItem.addClass("selected");

            var currentWrapper = $(".settings-wrapper");
            currentWrapper.hide();

            var newWrapper = $("<div/>", {id: "un-settingsWrapper", class: "scroller settings-wrapper settings-panel"});
            currentWrapper.after(newWrapper);

            var checkboxGroup = self.settingsCreateCheckboxGroup();
            checkboxGroup.append(self.settingsCreateCheckbox("Core (required)", true, "un-unPluginCoreEnabled"));
            checkboxGroup.append(self.settingsCreateCheckbox("UI", self.getSetting("unPluginUIEnabled"), "un-unPluginUIEnabled"));
            checkboxGroup.append(self.settingsCreateCheckbox("Search", self.getSetting("unPluginSearchEnabled"), "un-unPluginSearchEnabled"));
            checkboxGroup.append(self.settingsCreateCheckbox("Mute", self.getSetting("unPluginMuteEnabled"), "un-unPluginMuteEnabled"));

            checkboxGroup.find("#un-unPluginCoreEnabled").closest(".checkbox").addClass("disabled");

            newWrapper.append(self.settingsCreateGroup("Plugins (restart required)", checkboxGroup));

            newWrapper.find(".checkbox").on("click", function () {
                var input = $(this).find("input");
                var id = input.attr('id');

                if (id == "un-unPluginCoreEnabled") {
                    return;
                }

                input.is(":checked") ? input.prop("checked", false) : input.prop("checked", true);

                var setting = id.split("-")[1];
                localStorage[setting] = input.is(":checked");
            });
        });
    }
};

Core.prototype.settingsCreateGroup = function (title, content) {
    var group = $("<div/>", {class: "control-groups"});

    var inner = $("<div/>", {class: "control-group"});
    inner.append($("<label/>").html(title));
    inner.append(content);

    return group.html(inner);
};

Core.prototype.settingsCreateCheckboxGroup = function () {
    return $("<ul/>", {class: "checkbox-group"});
};

Core.prototype.settingsCreateCheckbox = function (title, checked, id) {
    var checkedString = checked ? "checked" : "";

    var inner = $("<div/>", {class: "checkbox-inner"}).html('<input id="' + id + '" ' + checkedString + ' type="checkbox" /><span></span>');

    var checkbox = $("<div/>", {class: "checkbox"});
    checkbox.append(inner);
    checkbox.append("<span>" + title + "</span>");

    return $("<li/>").html(checkbox);
};