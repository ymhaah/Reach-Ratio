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
// // TODO: get like num in each post
// // TODO: make the % and replace it
// TODO: #Bug, fix the father.querySelector error
// TODO: make the code smaller and easer to read (handlePageUpdate)
// ! take a break (leetCode and freelance)
// TODO: and the % as an ::after (and some css; make it look good)
// TODO: retweet vs tweet vs the not tweet things (from the user avatar image link)
// TODO: + save the % in the extension storage
// TODO: + make it stop when he click the icon
// TODO: + add more functionality (not just the like num)
// TODO: + add more sating
// ? high level var (used a lot) => Name_Name
let Profile_Name;
let Profile_Followers_Num = null;
let Tweet_Reply_Num = 0;
let Tweet_Retweet_Num = 0;
let Tweet_Like_Num = 0;
let Tweet_status_Num = 0;
let mainPath = "main [aria-label='Home timeline']";
// let tweetPath = "section article[data-testid='tweet']";
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
        const element = father
            ? father.querySelector(elementPath)
            : document.querySelector(elementPath);
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
function calculatePercentage(engagementNum, followerNum) {
    if (engagementNum === 0) {
        return "0%";
    }
    if (followerNum === 0) {
        return `${engagementNum}X`;
    }
    const percentage = Math.round((engagementNum / followerNum) * 100);
    return `${percentage}%`;
}
function handlePageUpdate(mutationsList, observer) {
    var _a, _b, _c, _d, _e;
    return __awaiter(this, void 0, void 0, function* () {
        for (const mutation of mutationsList) {
            if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
                loadRetries++;
                const addedElement = mutation.addedNodes[0];
                // ? if this element exist than you are in the profile page (unique to the profile page)
                const isProfilePage = yield isElementLoaded(`${mainPath} a[href='/${Profile_Name}/header_photo']`);
                if (isProfilePage) {
                    // ? when the profile page is loaded and we still does not know the follower num
                    const isFollowersLoaded = yield isElementLoaded(`${mainPath} a[href='/${Profile_Name}/verified_followers']`);
                    if (isFollowersLoaded) {
                        let followers = document.querySelector(`${mainPath} a[href='/${Profile_Name}/verified_followers']`);
                        Profile_Followers_Num = extractNumberFromString((_a = followers === null || followers === void 0 ? void 0 : followers.textContent) !== null && _a !== void 0 ? _a : "");
                        const isAddedElementTweet = yield isElementLoaded(`[data-testid="like"]`, addedElement);
                        if (isAddedElementTweet) {
                            let reply = addedElement.querySelector(`[data-testid="reply"]`);
                            let retweet = addedElement.querySelector(`[data-testid="retweet"]`);
                            let like = addedElement.querySelector(`[data-testid="like"]`);
                            let status = addedElement.querySelector(`[href^="/${Profile_Name}/status/"][href$="/analytics"]`);
                            Tweet_Reply_Num = extractNumberFromString((_b = reply === null || reply === void 0 ? void 0 : reply.textContent) !== null && _b !== void 0 ? _b : "");
                            Tweet_Retweet_Num = extractNumberFromString((_c = retweet === null || retweet === void 0 ? void 0 : retweet.textContent) !== null && _c !== void 0 ? _c : "");
                            Tweet_Like_Num = extractNumberFromString((_d = like === null || like === void 0 ? void 0 : like.textContent) !== null && _d !== void 0 ? _d : "");
                            Tweet_status_Num = extractNumberFromString((_e = status === null || status === void 0 ? void 0 : status.textContent) !== null && _e !== void 0 ? _e : "");
                            // reply!.textContent = calculatePercentage(
                            //     Tweet_Reply_Num as number,
                            //     Profile_Followers_Num as number
                            // );
                            // retweet!.textContent = calculatePercentage(
                            //     Tweet_Retweet_Num as number,
                            //     Profile_Followers_Num as number
                            // );
                            // like!.textContent = calculatePercentage(
                            //     Tweet_Like_Num as number,
                            //     Profile_Followers_Num as number
                            // );
                            // status!.textContent = calculatePercentage(
                            //     Tweet_status_Num as number,
                            //     Profile_Followers_Num as number
                            // );
                        }
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
