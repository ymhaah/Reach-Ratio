"use strict";
// ! var naming system :
// ! high level var (used a lot) => NAME_NAME & his sons
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const SUPPORTED_WEBSITES = [
    { URL: "https://twitter.com", TYPE: "SPA" },
];
let CURRENT_URL;
function isSupportedWebsite(currentURL) {
    // Check if the current URL matches any of the supported websites
    return SUPPORTED_WEBSITES.some((site) => currentURL.startsWith(site.URL));
}
function getCurrentUrl() {
    return new Promise((resolve) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            var _a;
            if (!tabs || tabs.length === 0 || !((_a = tabs[0]) === null || _a === void 0 ? void 0 : _a.url)) {
                resolve(null);
                return;
            }
            const URL = tabs[0].url;
            const tabId = tabs[0].id;
            // Check if the current website is supported
            if (isSupportedWebsite(URL)) {
                resolve({ URL, tabId });
            }
            else {
                // Skip processing for unsupported websites
                resolve(null);
            }
        });
    });
}
function sendCurrentUrl(currentUrl, tabId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Send the message to the content script
            const response = yield new Promise((resolve) => {
                chrome.tabs.sendMessage(tabId, { url: currentUrl }, resolve);
            });
            console.log("Received response from content script:", response);
        }
        catch (error) {
            console.error("Error sending message:", error);
        }
    });
}
function handelUrl() {
    return __awaiter(this, void 0, void 0, function* () {
        const URL_info = yield getCurrentUrl();
        if (URL_info && URL_info.URL && URL_info.tabId) {
            CURRENT_URL = URL_info.URL;
            yield sendCurrentUrl(CURRENT_URL, URL_info.tabId);
        }
        else {
            CURRENT_URL = null;
            console.log("CURRENT_URL:", CURRENT_URL);
        }
    });
}
// Initial processing
handelUrl();
// Listen for history state changes (for SPAs)
chrome.webNavigation.onHistoryStateUpdated.addListener(handelUrl);
// Listen for page load events (for regular pages)
chrome.webNavigation.onCompleted.addListener(handelUrl);
// "exclude_matches": [
//     "https://twitter.com/explore",
//     "https://twitter.com/home",
//     "https://twitter.com/notifications",
//     "https://twitter.com/messages"
// ],
