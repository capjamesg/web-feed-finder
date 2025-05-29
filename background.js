var tabsToWebFeeds = {};

browser.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.webFeedLink) {
        tabsToWebFeeds[sender.tab.id] = request.webFeedLink;
        chrome.pageAction.show(sender.tab.id);
    }

    sendResponse({});
    return true;
});

// if icon clicked, open the web feed link in a new tab
browser.pageAction.onClicked.addListener(function(tab) {
    var webFeedLink = tabsToWebFeeds[tab.id];
    if (webFeedLink) {
        browser.storage.sync.get('prefixUrl').then((result) => {
            const prefixUrl = result.prefixUrl || '';
            browser.tabs.create({ url: prefixUrl + encodeURIComponent(webFeedLink) });
        });
    }
});