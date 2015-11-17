/**
 * Unanimity
 */

var searchPlugin;

function SearchPlugin() {
}

SearchPlugin.prototype.init = function () {
    var self = this;

    var searchButton = $("<span/>", {id: "un-search"});

    $(".chat.flex-vertical.flex-spacer .title").append(searchButton);

    $("#un-search").on("click", function () {
        self.toggle();
    });

    $(document).on("click", "#un-searchBarClose", function () {
        $("#un-searchBar").remove();
        self.hideResults();
    });

    //noinspection JSUnresolvedVariable
    jQuery.hotkeys.options.filterInputAcceptingElements = false;
    //noinspection JSUnresolvedVariable
    jQuery.hotkeys.options.filterContentEditable = false;

    $(document).bind("keydown", "ctrl+f", function () {
        self.toggle();
    });

    $(document).bind("keydown", "meta+f", function () {
        self.toggle();
    });

    $(document).bind("keydown", "ctrl+g", function () {
        self.goTo(1);
    });

    $(document).bind("keydown", "meta+g", function () {
        self.goTo(1);
    });

    $(document).bind("keydown", "ctrl+shift+g", function () {
        self.goTo(-1);
    });

    $(document).bind("keydown", "shift+meta+g", function () {
        self.goTo(-1);
    });
};

SearchPlugin.prototype.didMutate = function () {
    var chat = $(".chat.flex-vertical.flex-spacer");

    if (!chat || chat.length == 0) {
        return;
    }

    var searchBar = $("#un-searchBar");

    if (searchBar && searchBar.length > 0) {
        searchBar.remove();
    }

    var messagesWrapper = $(".messages-wrapper");

    if (messagesWrapper && messagesWrapper.length > 1) {
        messagesWrapper.each(function (index) {
            if (index > 0) {
                $(this).remove();
            }
        });
    }

    if ($("#un-search").parent().prop("tagName") == undefined) {
        searchPlugin = new SearchPlugin();
        searchPlugin.init();
    }
};

SearchPlugin.prototype.search = function () {
    var term = $("#un-searchBarInput").val();

    this.hideResults();

    if (term.length < 3) {
        this.setMatches(-1);
        this.showControls(false);

        return;
    }

    var searchType;

    if ($("#un-searchBarMatchCase").is(":checked")) {
        searchType = "contains";
    } else {
        searchType = "iContains";

        $.extend($.expr[":"], {
            "iContains": function (element, i, match) {
                return (element.textContent || element.innerText || "").toLowerCase().indexOf((match[3] || "").toLowerCase()) >= 0;
            }
        });
    }

    var results = $("div.markup:" + searchType + "('" + term + "')");

    this.setMatches(results.length);
    this.showControls(true);

    results.each(function (i, element) {
        $(element).closest(".message-text").addClass("un-searchHighlight");
    });

    if (results.length > 0) {
        results.last().closest(".message-text").addClass("un-searchCurrent");

        var mostRecentElement = results.last().get(0);
        mostRecentElement.scrollIntoView();
    }
};

SearchPlugin.prototype.setMatches = function (number) {
    var matches = $("#un-searchBarMatches");

    if (number == -1) {
        matches.hide();
        matches.html("");

        return;
    }

    var matchesString;

    if (number == 0) {
        matchesString = "No matches";
    } else {
        matchesString = number + " " + (number > 1 ? "matches" : "match");
    }

    matches.html(matchesString);
    matches.css("display", "inline-block");
};

SearchPlugin.prototype.hideResults = function () {
    var messages = $("div.message-text");

    messages.removeClass("un-searchHighlight");
    messages.removeClass("un-searchCurrent");
};

SearchPlugin.prototype.toggle = function () {
    var self = this;

    var searchBar = $("#un-searchBar");

    if (searchBar && searchBar.length > 0) {
        searchBar.remove();
        self.hideResults();

        return;
    }

    searchBar = $("<div/>", {id: "un-searchBar"});
    searchBar.html($("<div/>", {id: "un-searchBarClose"}));
    searchBar.append($("<input/>", {id: "un-searchBarInput", type: "text", placeholder: "Search"}));

    var checkbox = $("<input/>", {id: "un-searchBarMatchCase", type: "checkbox"});
    checkbox = $("<div/>", {class: "checkbox-inner"}).html(checkbox);
    checkbox.append($("<span/>"));
    checkbox = $("<div/>", {class: "checkbox"}).html(checkbox);
    checkbox.append($("<span/>").html("Match Case"));
    searchBar.append(checkbox);

    /*
     checkbox = $("<input/>", { id: "un-searchBarRegex", type: "checkbox" });
     checkbox = $("<div/>", { class: "checkbox-inner" }).html(checkbox);
     checkbox.append($("<span/>"));
     checkbox = $("<div/>", { class: "checkbox" }).html(checkbox);
     checkbox.append($("<span/>").html("Regex"));
     searchBar.append(checkbox);
     */

    var searchBarInfos = $("<div/>", {id: "un-searchBarInfos"});

    var matches = $("<div/>", {id: "un-searchBarMatches"});
    searchBarInfos.append(matches);

    var previous = $("<div/>", {id: "un-searchBarPrevious"});
    searchBarInfos.append(previous);
    var next = $("<div/>", {id: "un-searchBarNext"});
    searchBarInfos.append(next);

    searchBar.append(searchBarInfos);

    $(".chat.flex-vertical.flex-spacer .messages-wrapper").before(searchBar);

    var input = $("#un-searchBarInput");
    input.focus();

    searchBar.find(".checkbox").on("click", function () {
        var input = $(this).find("input");
        input.is(":checked") ? input.prop("checked", false) : input.prop("checked", true);

        self.search();
    });

    input.on("input", function () {
        self.search();
    });

    searchBar.find("#un-searchBarPrevious").on("click", function () {
        self.goTo(-1);
    });

    searchBar.find("#un-searchBarNext").on("click", function () {
        self.goTo(1);
    });

    searchBar.find("#un-searchBarInput").bind("keydown", "ctrl+f", function () {
        self.toggle();
    });

    searchBar.find("#un-searchBarInput").bind("keydown", "meta+f", function () {
        self.toggle();
    });

    searchBar.find("#un-searchBarInput").bind("keydown", "esc", function () {
        self.toggle();
    });

    searchBar.find("#un-searchBarInput").bind("keydown", "ctrl+g", function () {
        self.goTo(1);
    });

    searchBar.find("#un-searchBarInput").bind("keydown", "meta+g", function () {
        self.goTo(1);
    });

    searchBar.find("#un-searchBarInput").bind("keydown", "ctrl+shift+g", function () {
        self.goTo(-1);
    });

    searchBar.find("#un-searchBarInput").bind("keydown", "shift+meta+g", function () {
        self.goTo(-1);
    });

    searchBar.find("#un-searchBarInput").bind("keydown", "return", function () {
        self.goTo(1);
    });

    searchBar.find("#un-searchBarInput").bind("keydown", "shift+return", function () {
        self.goTo(-1);
    });
};

SearchPlugin.prototype.goTo = function (direction) {
    var results = $(".un-searchHighlight");
    var current = $(".un-searchCurrent");

    if (results.length < 2) {
        return;
    }

    var currentIndex = results.index(results.filter(".un-searchCurrent"));

    var newIndex;

    if (direction == 1) {
        newIndex = currentIndex + 1;
    } else if (direction == -1) {
        newIndex = currentIndex - 1;
    } else {
        return;
    }

    if (newIndex < 0) {
        newIndex = results.length - 1;
    } else if (newIndex > results.length - 1) {
        newIndex = 0;
    }

    current.removeClass("un-searchCurrent");

    results.eq(newIndex).addClass("un-searchCurrent");

    var newCurrent = results.eq(newIndex).get(0);
    newCurrent.scrollIntoView();
};

SearchPlugin.prototype.showControls = function (show) {
    var controls = $("#un-searchBarPrevious, #un-searchBarNext");

    if (!show) {
        controls.hide();
    } else {
        controls.css("display", "inline-block");
    }
};