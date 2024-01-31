"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function isSupportedWebsite(url) {
    // list of supported websites
    const supportedWebsites = ["https://twitter.com"];
    // Check if the current URL matches any of the supported websites
    return supportedWebsites.some((website) => url.startsWith(website));
}
function getCurrentUrl() {
    return new Promise((resolve) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            var _a;
            if (!tabs || tabs.length === 0 || !((_a = tabs[0]) === null || _a === void 0 ? void 0 : _a.url)) {
                resolve(null);
                return;
            }
            const currentUrl = tabs[0].url;
            // Check if the current website is supported
            if (isSupportedWebsite(currentUrl)) {
                resolve(currentUrl);
            }
            else {
                // Skip processing for unsupported websites
                resolve(null);
            }
        });
    });
}
// Handle initial URL
getCurrentUrl().then((initialUrl) => {
    if (initialUrl) {
        console.log("Initial URL:", initialUrl);
    }
    else {
        console.log("Not on a supported website.");
    }
});
// Listen for history state changes (for SPAs)
chrome.webNavigation.onHistoryStateUpdated.addListener((details) => __awaiter(void 0, void 0, void 0, function* () {
    const url = yield getCurrentUrl();
    if (url) {
        console.log("Updated URL (SPA):", url);
    }
}));
// Listen for page load events (for regular pages)
chrome.webNavigation.onCompleted.addListener((details) => __awaiter(void 0, void 0, void 0, function* () {
    const url = yield getCurrentUrl();
    if (url) {
        console.log("Updated URL (Regular):", url);
    }
}));
// "exclude_matches": [
//     "https://twitter.com/explore",
//     "https://twitter.com/home",
//     "https://twitter.com/notifications",
//     "https://twitter.com/messages"
// ],
