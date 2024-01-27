async function sendUrl(message: string) {
    try {
        // Query for the active tab
        const [tab] = await chrome.tabs.query({
            active: true,
            lastFocusedWindow: true,
        });

        if (!tab) {
            throw new Error("No active tab found.");
        }

        // Send the message to the content script in the active tab
        const response = await chrome.tabs.sendMessage(tab.id, message);

        if (chrome.runtime.lastError) {
            // throw new Error(chrome.runtime.lastError);
        }

        console.log(response);
    } catch (error) {
        // console.error("Error in sendUrl:", error);
    }
}

sendUrl("hi");

// "exclude_matches": [
//     "https://twitter.com/explore",
//     "https://twitter.com/home",
//     "https://twitter.com/notifications",
//     "https://twitter.com/messages"
// ],
