// TODO: the website loading state

// contentScript.js

// function handlePageUpdate(mutationsList: any[], observer) {
//     for (const mutation of mutationsList) {
//         if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
//             // Content has been added to the DOM, now you can try to access the element
//             console.log(mutation);
//         }
//     }
// }

// const pageUpdateObserver = new MutationObserver(handlePageUpdate);

// pageUpdateObserver.observe(document.body, { childList: true, subtree: true });

// function accessElement() {
//     const followersNum = document.querySelector(
//         ".css-1qaijid.r-bcqeeo.r-qvutc0.r-poiln3"
//     );

//     if (followersNum) {
//         console.log(followersNum);
//         console.log(followersNum.textContent);
//     }
// }

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

// chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
//     console.log(
//         sender.tab
//             ? "from a content script:" + sender.tab.url
//             : "from the extension"
//     );
//     if (request.greeting === "hello") sendResponse({ farewell: "goodbye" });
// });

// async function main() {
//     const isLoaded = await isSiteLoaded(document.querySelector("main [aria-label='Home timeline'] a[href='/hafanwy/header_photo'] "));
//     if (isLoaded) {
//         console.log("The website is fully loaded.");
//     } else {
//         console.log("Failed to load the website after 20 retries.");
//     }
// }

// main();
