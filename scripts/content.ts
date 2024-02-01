// contentScript.js

// TODO: the website loading state

let Profile_Name: string | null;

chrome.runtime.onMessage.addListener(
    async (request: { url: string }, sender, sendResponse) => {
        let page_URL = new URL(request.url);
        let pathname = page_URL.pathname;

        const parts = pathname.split("/");
        Profile_Name = parts[parts.length - 1];

        console.log(Profile_Name);
        // Process the message and send a response back if needed
        // const response = { farewell: "Goodbye from content script!" };
        // sendResponse(response);
    }
);

async function accessElement(selector: string): Promise<boolean> {
    const element = document.querySelector(selector);

    if (element) return true;
    return false;
}

async function handlePageUpdate(
    mutationsList: MutationRecord[],
    observer: MutationObserver
) {
    for (const mutation of mutationsList) {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
            const isProfilePage = await accessElement(
                `main [aria-label='Home timeline'] a[href='/${Profile_Name}/header_photo']`
            );
            if (isProfilePage) {
                console.log("Element found!");
                break;
            }
        }
    }
}
const pageUpdateObserver = new MutationObserver(handlePageUpdate);

pageUpdateObserver.observe(document.body, { childList: true, subtree: true });

// window.addEventListener("load", function () {
//     accessElement();
//     // Your code to run when the entire page, including external resources, has finished loading
// });

// Function to check if the website is fully loaded
// async function isSiteLoaded(
//     checkedElement: HTMLElement,
//     maxRetries: number = 20,
//     delay: number = 1000
// ): Promise<boolean> {
//     let retries = 0;

//     while (retries < maxRetries) {
//         if (document.readyState === "complete" && checkedElement) {
//             // The document is fully loaded
//             return true;
//         }
//         await new Promise((resolve) => setTimeout(resolve, delay));
//         retries++;
//     }
//     return false;
// }
