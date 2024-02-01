"use strict";
// contentScript.js
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// TODO: the website loading state
let Profile_Name;
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => __awaiter(void 0, void 0, void 0, function* () {
    let page_URL = new URL(request.url);
    let pathname = page_URL.pathname;
    const parts = pathname.split("/");
    Profile_Name = parts[parts.length - 1];
    console.log(Profile_Name);
    // Process the message and send a response back if needed
    // const response = { farewell: "Goodbye from content script!" };
    // sendResponse(response);
}));
function accessElement(selector) {
    return __awaiter(this, void 0, void 0, function* () {
        const element = document.querySelector(selector);
        if (element)
            return true;
        return false;
    });
}
function handlePageUpdate(mutationsList, observer) {
    return __awaiter(this, void 0, void 0, function* () {
        for (const mutation of mutationsList) {
            if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
                const isProfilePage = yield accessElement(`main [aria-label='Home timeline'] a[href='/${Profile_Name}/header_photo']`);
                if (isProfilePage) {
                    console.log("Element found!");
                    break;
                }
            }
        }
    });
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
