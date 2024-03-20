// service worker / background

type supportedWebsiteT = {
    URL: string;
    TYPE: "SPA" | "Regular";
};

const Supported_Websites: supportedWebsiteT[] = [
    { URL: "https://twitter.com", TYPE: "SPA" },
];

let Current_Url: string | null;

// ? Check if the current URL matches any of the supported websites
function isSupportedWebsite(currentURL: string): boolean {
    return Supported_Websites.some((site) => currentURL.startsWith(site.URL));
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

            if (isSupportedWebsite(URL)) {
                resolve({ URL, tabId });
            } else {
                resolve(null);
            }
        });
    });
}

// ? Send a message with the url to the content script
async function sendCurrentUrl(
    currentUrl: string,
    tabId: number
): Promise<void> {
    try {
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
        Current_Url = URL_info.URL;
        await sendCurrentUrl(Current_Url, URL_info.tabId);
    } else {
        Current_Url = null;
    }
}
handelUrl();

// ? Listen for history state changes (for SPAs)
chrome.webNavigation.onHistoryStateUpdated.addListener(handelUrl);

// ? Listen for page load events (for regular pages)
chrome.webNavigation.onCompleted.addListener(handelUrl);
