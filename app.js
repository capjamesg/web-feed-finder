var selectors = [
    "application/xml",
    "application/rss+xml",
    "application/atom+xml",
    "application/activity+json",
    "application/feed+json",
    "application/mf2+json",
    "text/mf2+html",
];

var browser = (typeof browser !== "undefined") ? browser : chrome;

var selectorsWithoutApplication = selectors.map(function(selector) {
    return selector.replace("application/", "");
});

function findFediverseAuthorLink () {
    var link = document.querySelector('meta[name="fediverse:creator"]');
    if (link) {
        return link.getAttribute("content");
    }
}

function findWebFeedLink () {
    var webFeedLink = null;

    for (var selector in selectors) {
        var links = document.querySelectorAll(`link[type="${selectors[selector]}"]`);
        if (links.length == 0) { continue };
        for (var link in links) {
            // skip comments
            console.log(links[link])
            if (links[link].title?.toLowerCase().includes("comment")) { continue }
            webFeedLink = links[link].href;
            break;
        }
    }

    if (!webFeedLink) {
        var likelyhFeed = document.querySelector(".h-feed");
        // var hEntries = document.querySelectorAll(".h-entry");

        if (likelyhFeed) {
            console.log("h-feed found, inferring as a feed");
            webFeedLink = window.location.href;
        }
        // if (hEntries.length > 1) {
        //     console.log("Multiple h-entrys found, inferring as a feed");
        //     // multiple h-entrys can be inferred as a feed
        //     webFeedLink = window.location.href;
        // }
    }
    browser.runtime.sendMessage({
        webFeedLink: document.location.href,
        feedLink: webFeedLink,
        contentType: document.contentType,
        fediverseLink: findFediverseAuthorLink(),
    });
}

findWebFeedLink();