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
function sendUrl(message) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Query for the active tab
            const [tab] = yield chrome.tabs.query({
                active: true,
                lastFocusedWindow: true,
            });
            if (!tab) {
                throw new Error("No active tab found.");
            }
            // Send the message to the content script in the active tab
            const response = yield chrome.tabs.sendMessage(tab.id, message);
            if (chrome.runtime.lastError) {
                // throw new Error(chrome.runtime.lastError);
            }
            console.log(response);
        }
        catch (error) {
            // console.error("Error in sendUrl:", error);
        }
    });
}
sendUrl("hi");
// "exclude_matches": [
//     "https://twitter.com/explore",
//     "https://twitter.com/home",
//     "https://twitter.com/notifications",
//     "https://twitter.com/messages"
// ],
