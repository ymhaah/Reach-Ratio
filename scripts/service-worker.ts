// ! var naming system :
// ! high level var (used a lot) => NAME_NAME & his sons

type SupportedWebsite = {
    URL: string;
    TYPE: "SPA" | "Regular";
};

const SUPPORTED_WEBSITES: SupportedWebsite[] = [
    { URL: "https://twitter.com", TYPE: "SPA" },
];

let CURRENT_URL: string | null;

function isSupportedWebsite(currentURL: string): boolean {
    // Check if the current URL matches any of the supported websites
    return SUPPORTED_WEBSITES.some((site) => currentURL.startsWith(site.URL));
}

function getCurrentUrl(): Promise<{
    URL: string;
    tabId: number | undefined;
} | null> {
    return new Promise((resolve) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (!tabs || tabs.length === 0 || !tabs[0]?.url) {
                resolve(null);
                return;
            }

            const URL = tabs[0].url;
            const tabId = tabs[0].id;

            // Check if the current website is supported
            if (isSupportedWebsite(URL)) {
                resolve({ URL, tabId });
            } else {
                // Skip processing for unsupported websites
                resolve(null);
            }
        });
    });
}

async function sendCurrentUrl(
    currentUrl: string,
    tabId: number
): Promise<void> {
    try {
        // Send the message to the content script
        const response = await new Promise<void>((resolve) => {
            chrome.tabs.sendMessage(tabId, { url: currentUrl }, resolve);
        });

        console.log("Received response from content script:", response);
    } catch (error) {
        console.error("Error sending message:", error);
    }
}

async function handelUrl(): Promise<void> {
    const URL_info = await getCurrentUrl();

    if (URL_info && URL_info.URL && URL_info.tabId) {
        CURRENT_URL = URL_info.URL;
        await sendCurrentUrl(CURRENT_URL, URL_info.tabId);
    } else {
        CURRENT_URL = null;
        console.log("CURRENT_URL:", CURRENT_URL);
    }
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
