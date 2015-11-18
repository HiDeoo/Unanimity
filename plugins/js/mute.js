/**
 * Unanimity
 */

var mutePlugin;

function MutePlugin() {
}

MutePlugin.prototype.init = function () {
    var muteButton = $("<div/>", {id: "un-muteAllText"});

    $(".guild-channels header button").first().parent().parent().before(muteButton);

    muteButton = $("#un-muteAllText");

    muteButton.on("click", function () {
        var selectedIndex = $(".guild-channels li.channel-text.selected").index();

        var channels = $(".guild-channels li.channel-text");

        channels.each(function () {
            $(this).find("span").trigger("click");
            $(".channel-mute-button").delay(500).trigger("click");
        });

        channels.eq(selectedIndex).find("span").trigger("click");
    });

    muteButton.hover(function () {
        var tooltip = $("<div/>", {class: "tooltip tooltip-top tooltip-normal"});
        tooltip.css('top', $(this).offset().top - 21 + 'px');
        tooltip.css('left', $(this).offset().left - 61 + 'px');
        tooltip.html("Mute All Text Channels");

        $(".tooltips").html(tooltip);
    }, function () {
        $(".tooltips").empty();
    });
};

MutePlugin.prototype.didMutate = function () {
    var guildChannels = $(".guild-channels");

    if (!guildChannels || guildChannels.length == 0) {
        return;
    }

    if ($("#un-muteAllText").parent().prop("tagName") == undefined) {
        mutePlugin = new MutePlugin();
        mutePlugin.init();
    }
};