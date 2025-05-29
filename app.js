var selectors = [
    "application/xml",
    "application/rss+xml",
    "application/atom+xml",
    "application/activity+json",
    "application/feed+json",
    "application/mf2+json",
    "application/mf2+html", // check this
];

var selectorsWithoutApplication = selectors.map(function(selector) {
    return selector.replace("application/", "");
});

function findWebFeedLink () {
    var webFeedLink = null;

    for (var selector in selectors) {
        var links = document.querySelectorAll(`link[type="${selectors[selector]}"]`);
        if (links.length == 0) { continue };
        for (var link in links) {
            if ("comment" in links[link].attributes) { continue }
            webFeedLink = links[link].href;
            break;
        }
    }

    if (!webFeedLink) {
        var likelyhFeed = document.querySelector(".h-feed");
        var hEntries = document.querySelectorAll(".h-entry");

        if (likelyhFeed) {
            webFeedLink = window.location.href;
        } else if (hEntries.length > 1) {
            // multiple h-entrys can be inferred as a feed
            webFeedLink = window.location.href;
        }
    }

    browser.runtime.sendMessage({
        webFeedLink: webFeedLink,
    });
}

findWebFeedLink();