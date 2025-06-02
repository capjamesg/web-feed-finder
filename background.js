var tabsToWebFeeds = {};
var subscriptions = {};
var iconPreference = "grey";
var userUrl = "";

var browser = (typeof browser !== "undefined") ? browser : chrome;
var isFirefox = typeof browser.runtime.getBrowserInfo === "function";
var pageAction = browser.pageAction || browser.action;

function refetchSubscriptions () {
    browser.storage.sync.get({subscriptions: {}, userUrl: "" }).then((result) => {
        userUrl = result.userUrl;
        if (!result.userUrl) { return false; }
        fetch(userUrl).then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Network response was not ok');
            }
        }).then(data => {
            subscriptions = data;
            browser.storage.sync.set({subscriptions: subscriptions});
        });
    });
}

browser.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.feedLink) {
        tabsToWebFeeds[sender.tab.id] = request.webFeedLink;
        if (iconPreference === "grey") {
            pageAction.setIcon({
                tabId: sender.tab.id,
                path: {
                    16: "/assets/rss-white.png"
                }
            });
        } else {
            pageAction.setIcon({
                tabId: sender.tab.id,
                path: {
                    16: "/assets/rss.png"
                }
            });
        }
        if (isFirefox) {
            pageAction.show(sender.tab.id);
        } else {
            browser.action.show(sender.tab.id);
        }
    } else {
        if (isFirefox) {
            // if no webFeedLink, hide the page action icon
            pageAction.hide(sender.tab.id);
        }
        delete tabsToWebFeeds[sender.tab.id];
    }
    if (request.contentType.includes("xml") && userUrl && !request.webFeedLink?.includes("?raw")) {
        chrome.tabs.update(sender.tab.id, {
            url: userUrl + encodeURIComponent(request.webFeedLink)
        });
    }

    sendResponse({});
    return true;
});

// listen for change to storage
browser.storage.onChanged.addListener(function(changes, area) {
    if (area === 'sync') {
        console.log("Storage changed:", changes);
        if (changes.iconPreference) {
            iconPreference = changes.iconPreference.newValue;

            for (let tabId in tabsToWebFeeds) {
                // check if tab id exists in browser.tabs
                if (!browser.tabs.get(parseInt(tabId))) {
                    continue;
                }
                pageAction.setIcon({
                    tabId: parseInt(tabId),
                    path: {
                        16: iconPreference === "grey" ? "/assets/rss-white.png" : "/assets/rss.png"
                    }
                });
            }
        }
        if (changes.subscriptions) {
            subscriptions = changes.subscriptions.newValue;
        }
        if (changes.prefixUrl) {
            userUrl = changes.prefixUrl.newValue;
        }
    }
});

// if icon clicked, open the web feed link in a new tab
pageAction.onClicked.addListener(function(tab) {
    var webFeedLink = tabsToWebFeeds[tab.id];
    if (webFeedLink) {
        browser.storage.sync.get('prefixUrl').then((result) => {
            const prefixUrl = result.prefixUrl || '';
            browser.tabs.create({ url: prefixUrl + encodeURIComponent(webFeedLink) });
            // resync feeds
            refetchSubscriptions();
        });
    }
});

refetchSubscriptions();