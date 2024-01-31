function isSupportedWebsite(url: string): boolean {
    // list of supported websites
    const supportedWebsites = ["https://twitter.com"];

    // Check if the current URL matches any of the supported websites
    return supportedWebsites.some((website) => url.startsWith(website));
}

function getCurrentUrl(): Promise<string | null> {
    return new Promise((resolve) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (!tabs || tabs.length === 0 || !tabs[0]?.url) {
                resolve(null);
                return;
            }

            const currentUrl = tabs[0].url;

            // Check if the current website is supported
            if (isSupportedWebsite(currentUrl)) {
                resolve(currentUrl);
            } else {
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
    } else {
        console.log("Not on a supported website.");
    }
});

// Listen for history state changes (for SPAs)
chrome.webNavigation.onHistoryStateUpdated.addListener(async (details) => {
    const url = await getCurrentUrl();
    if (url) {
        console.log("Updated URL (SPA):", url);
    }
});

// Listen for page load events (for regular pages)
chrome.webNavigation.onCompleted.addListener(async (details) => {
    const url = await getCurrentUrl();
    if (url) {
        console.log("Updated URL (Regular):", url);
    }
});

// "exclude_matches": [
//     "https://twitter.com/explore",
//     "https://twitter.com/home",
//     "https://twitter.com/notifications",
//     "https://twitter.com/messages"
// ],
