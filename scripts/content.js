"use strict";
// contentScript.js
// // TODO: save followers num in the extension storage
// // TODO: know your in the profile page
// // TODO: get user name from the url
// // TODO: get follower num
// // TODO: get like num in each post
// // TODO: make the % and replace it
// // take a break (leetCode and freelance)
// // TODO: 1- #Bug, fix the father.querySelector error
// TODO: add the % as an ::after (and some css; make it look good)
// TODO: make the code smaller and easer to read (handlePageUpdate)
// TODO: #Bug fix the 123K return 123 not 123000 (use the aria or make a function)
// TODO: #Bug, when a tweet is already loaded it doesn't work
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
let maxLoadRetries = 30;
// ? Process the message and send a response back if needed
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    let page_URL = new URL(request.url);
    let pathName = page_URL.pathname;
    const urlPateLevels = pathName.split("/");
    // ! will only by the right name in the profile page if you want use.
    Profile_Name = urlPateLevels[urlPateLevels.length - 1];
    const response = { Profile_Name: Profile_Name };
    sendResponse(response);
});
function isElementLoaded(elementPath, father) {
    if (father instanceof Element) {
        const element = father.querySelector(elementPath);
        return element !== null;
    }
    else {
        const element = document.querySelector(elementPath);
        return element !== null;
    }
}
function extractNumberFromString(inputString) {
    const extractedNumber = parseInt(inputString.replace(/\D/g, ""), 10) || 0;
    return extractedNumber;
}
function calculatePercentage(engagementNum, followerNum) {
    if (engagementNum === 0 || followerNum === 0) {
        return null;
    }
    const percentage = Math.round((engagementNum / followerNum) * 100);
    return `${percentage}%`;
}
function handlePageUpdate(mutationsList, observer) {
    var _a, _b;
    for (const mutation of mutationsList) {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
            loadRetries++;
            const addedElement = mutation.addedNodes[0];
            // ? if this element exist than you are in the profile page (unique to the profile page)
            const isProfilePage = isElementLoaded(`${mainPath} a[href='/${Profile_Name}/header_photo']`);
            // if (maxLoadRetries < loadRetries && !isProfilePage) {
            //     observer.disconnect();
            //     console.log("stop");
            // }
            if (isProfilePage) {
                // ? when the profile page is loaded and we still does not know the follower num
                const isFollowersLoaded = isElementLoaded(`${mainPath} a[href='/${Profile_Name}/verified_followers']`);
                if (isFollowersLoaded) {
                    let followers = document.querySelector(`${mainPath} a[href='/${Profile_Name}/verified_followers']`);
                    Profile_Followers_Num = extractNumberFromString((_a = followers === null || followers === void 0 ? void 0 : followers.textContent) !== null && _a !== void 0 ? _a : "");
                    const isAddedElementMyTweet = isElementLoaded(`[href^="/${Profile_Name}/status/"][href$="/analytics"]`, addedElement);
                    if (isAddedElementMyTweet &&
                        addedElement instanceof HTMLElement) {
                        const tweetSelectors = [
                            `[data-testid="reply"]`,
                            `[data-testid="retweet"]`,
                            `[data-testid="like"]`,
                            `[href^="/${Profile_Name}/status/"][href$="/analytics"]`,
                        ];
                        for (const selector of tweetSelectors) {
                            const isElementPresent = isElementLoaded(selector, addedElement);
                            if (isElementPresent) {
                                const element = addedElement.querySelector(selector);
                                const tweetNum = extractNumberFromString((_b = element === null || element === void 0 ? void 0 : element.textContent) !== null && _b !== void 0 ? _b : "");
                                const percentage = calculatePercentage(tweetNum, Profile_Followers_Num);
                                if (percentage) {
                                    // element?.style.cssText = "position: relative;"
                                    let percentageDiv = document.createElement("div");
                                    percentageDiv.classList.add("Reach-Ratio");
                                    // percentageDiv.setAttribute('data-engagement', percentage);
                                    percentageDiv.textContent = percentage;
                                    element.appendChild(percentageDiv);
                                }
                            }
                        }
                        // const isReply = isElementLoaded(
                        //     `[data-testid="reply"]`,
                        //     addedElement
                        // );
                        // if (isReply) {
                        //     let reply = addedElement.querySelector(
                        //         `[data-testid="reply"]`
                        //     );
                        //     Tweet_Reply_Num = extractNumberFromString(
                        //         reply?.textContent ?? ""
                        //     );
                        //     reply!.textContent = calculatePercentage(
                        //         Tweet_Reply_Num as number,
                        //         Profile_Followers_Num as number
                        //     );
                        // }
                        // const isRetweet = isElementLoaded(
                        //     `[data-testid="retweet"]`,
                        //     addedElement
                        // );
                        // if (isRetweet) {
                        //     let retweet = addedElement.querySelector(
                        //         `[data-testid="retweet"]`
                        //     );
                        //     Tweet_Retweet_Num = extractNumberFromString(
                        //         retweet?.textContent ?? ""
                        //     );
                        //     retweet!.textContent = calculatePercentage(
                        //         Tweet_Retweet_Num as number,
                        //         Profile_Followers_Num as number
                        //     );
                        // }
                        // const isLike = isElementLoaded(
                        //     `[data-testid="like"]`,
                        //     addedElement
                        // );
                        // if (isLike) {
                        //     let like =
                        //         addedElement.querySelector(
                        //             `[data-testid="like"]`
                        //         );
                        //     Tweet_Like_Num = extractNumberFromString(
                        //         like?.textContent ?? ""
                        //     );
                        //     like!.textContent = calculatePercentage(
                        //         Tweet_Like_Num as number,
                        //         Profile_Followers_Num as number
                        //     );
                        // }
                        // const isStatus = isElementLoaded(
                        //     `[href^="/${Profile_Name}/status/"][href$="/analytics"]`,
                        //     addedElement
                        // );
                        // if (isStatus) {
                        //     let status = addedElement.querySelector(
                        //         `[href^="/${Profile_Name}/status/"][href$="/analytics"]`
                        //     );
                        //     Tweet_status_Num = extractNumberFromString(
                        //         status?.textContent ?? ""
                        //     );
                        //     status!.textContent = calculatePercentage(
                        //         Tweet_status_Num as number,
                        //         Profile_Followers_Num as number
                        //     );
                        // }
                    }
                }
            }
        }
    }
}
const pageUpdateObserver = new MutationObserver(handlePageUpdate);
pageUpdateObserver.observe(document.body, {
    childList: true,
    subtree: true,
});
