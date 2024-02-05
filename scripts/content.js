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
// // TODO: save followers num in the extension storage
// // TODO: know your in the profile page
// // TODO: get user name from the url
// // TODO: get follower num
// TODO: get like num in each post
// TODO: retweet vs tweet vs the not tweet things (from the user avatar image link)
// TODO: make the % and replace it
// TODO: + save the % in the extension storage
// TODO: + make it stop when he click the icon
// TODO: + add more functionality (not just the like num)
// TODO: + add more seating
// ? high level var (used a lot) => Name_Name
let Profile_Name;
let Profile_Followers_Num = null;
let mainPath = "main [aria-label='Home timeline']";
let tweetPath = "section article[data-testid='tweet']";
let loadRetries = 0;
let maxLoadRetries = 20;
// ? Process the message and send a response back if needed
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => __awaiter(void 0, void 0, void 0, function* () {
    let page_URL = new URL(request.url);
    let pathName = page_URL.pathname;
    const urlPateLevels = pathName.split("/");
    // ! will only by the right name in the profile page if you want use.
    Profile_Name = urlPateLevels[urlPateLevels.length - 1];
    const response = { Profile_Name: Profile_Name };
    sendResponse(response);
}));
function isElementLoaded(elementPath, father) {
    return __awaiter(this, void 0, void 0, function* () {
        let element = document.querySelector(elementPath);
        if (father) {
            element = father.querySelector(elementPath);
        }
        if (element) {
            return true;
        }
        else {
            return false;
        }
    });
}
function extractNumberFromString(inputString) {
    const extractedNumber = parseInt(inputString.replace(/\D/g, ""), 10) || null;
    return extractedNumber;
}
function handlePageUpdate(mutationsList, observer) {
    return __awaiter(this, void 0, void 0, function* () {
        for (const mutation of mutationsList) {
            if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
                loadRetries++;
                // const addedElement = mutation.addedNodes[0] as HTMLElement;
                // const isAddedElementTweet = await isElementLoaded(
                //     `[data-testid="like"]`,
                //     addedElement
                // );
                // if (isAddedElementTweet) {
                //     let likeNum =
                //         addedElement.querySelector(
                //             `[data-testid="like"]`
                //         )?.textContent;
                //     console.log(likeNum);
                // }
                // ? if this element exist than you are in the profile page (unique to the profile page)
                const isProfilePage = yield isElementLoaded(`${mainPath} a[href='/${Profile_Name}/header_photo']`);
                if (isProfilePage && !Profile_Followers_Num) {
                    // ? when the profile page is loaded and we still does not know the follower num
                    const isFollowersLoaded = yield isElementLoaded(`${mainPath} a[href='/${Profile_Name}/verified_followers']`);
                    if (isFollowersLoaded) {
                        let followers = document.querySelector(`${mainPath} a[href='/${Profile_Name}/verified_followers']`);
                        Profile_Followers_Num = extractNumberFromString(followers === null || followers === void 0 ? void 0 : followers.textContent);
                        console.log(Profile_Followers_Num);
                    }
                }
            }
        }
    });
}
const pageUpdateObserver = new MutationObserver(handlePageUpdate);
pageUpdateObserver.observe(document.body, { childList: true, subtree: true });
// if (loadRetries > maxLoadRetries && !Profile_Followers_Num) {
//     pageUpdateObserver.disconnect();
// }
