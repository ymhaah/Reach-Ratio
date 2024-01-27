"use strict";
// contentScript.js
// TODO: the website loading state
// async function accessElement(selector: string): Promise<boolean> {
//     const element = document.querySelector(selector);
//     if (element) return true;
//     return false;
// }
// async function handlePageUpdate(
//     mutationsList: MutationRecord[],
//     observer: MutationObserver
// ) {
//     for (const mutation of mutationsList) {
//         if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
//             const isProfilePage = await accessElement(
//                 "main [aria-label='Home timeline'] a[href='/hafanwy/header_photo']"
//             );
//             if (isProfilePage) {
//                 console.log("Element found!");
//                 break;
//             }
//         }
//     }
// }
// const pageUpdateObserver = new MutationObserver(handlePageUpdate);
// pageUpdateObserver.observe(document.body, { childList: true, subtree: true });
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
//     console.log(sender, request);
//     sendResponse({ farewell: "goodbye" });
// });
