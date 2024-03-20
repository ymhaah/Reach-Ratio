"use strict";
// contentScript.js
let ProfileName = handleUrl(window.location.href);
let ProfileFollowersNum = null;
let loadRetries = 0;
const maxLoadRetries = 30;
const mainPath = "main [aria-label='Home timeline']";
const tweetPath = "section article[data-testid='tweet']";
// ? get a message when the page url change
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // Extract profile name from the URL
    ProfileName = handleUrl(request.url);
    ProfileFollowersNum = getFollowersNum(ProfileName);
    const tweetsDom = document.querySelectorAll(tweetPath);
    // Iterate over each tweet element
    tweetsDom.forEach((tweet) => {
        // Check if the tweet belongs to the profile and if it not the timeline div
        const isAddedElementMyTweet = isElementLoaded(`[href^="/${ProfileName}/status/"][href$="/analytics"]`, tweet);
        // Check if it is not the timeline div (tweet duplicate bug)
        const isTimeLine = tweet.querySelectorAll(`[href^="/${ProfileName}/status/"][href$="/analytics"]`);
        // if profile followers is available
        if (isAddedElementMyTweet &&
            tweet &&
            isTimeLine.length === 1 &&
            ProfileFollowersNum) {
            addPercentageToTweet(tweet, ProfileName, ProfileFollowersNum);
        }
    });
    // Re-observe when the page change (for SPA websites)
    reObserve();
    // Send response back to service worker with the profile name (for no reason)
    sendResponse({ ProfileName: ProfileName });
});
const pageUpdateObserver = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
        if (mutation.type === "childList" &&
            mutation.addedNodes.length > 0) {
            const addedElement = mutation.addedNodes[0];
            ProfileFollowersNum = getFollowersNum(ProfileName);
            if (ProfileFollowersNum) {
                // Check if the tweet belongs to the profile and if it not the timeline div
                const isAddedElementMyTweet = isElementLoaded(`[href^="/${ProfileName}/status/"][href$="/analytics"]`, addedElement);
                // Check if it is not the timeline div (tweet duplicate bug)
                const isTimeLine = addedElement.querySelectorAll(`[href^="/${ProfileName}/status/"][href$="/analytics"]`);
                if (isAddedElementMyTweet &&
                    addedElement &&
                    isTimeLine.length === 1) {
                    addPercentageToTweet(addedElement, ProfileName, ProfileFollowersNum);
                }
            }
            else {
                loadRetries++;
                if (loadRetries > maxLoadRetries) {
                    pageUpdateObserver.disconnect();
                    loadRetries = 0;
                }
            }
        }
    }
});
pageUpdateObserver.observe(document.body, {
    childList: true,
    subtree: true,
});
// ? Re-observe when the page change (for SPA websites)
function reObserve() {
    pageUpdateObserver.disconnect();
    pageUpdateObserver.observe(document.body, {
        childList: true,
        subtree: true,
    });
}
function getFollowersNum(ProfileName) {
    var _a;
    let isProfileLoaded = isElementLoaded(`${mainPath} a[href='/${ProfileName}/verified_followers']`);
    if (isProfileLoaded) {
        const followersElement = document.querySelector(`${mainPath} a[href='/${ProfileName}/verified_followers']`);
        const followers = extractNumberFromString((_a = followersElement === null || followersElement === void 0 ? void 0 : followersElement.textContent) !== null && _a !== void 0 ? _a : "");
        return followers;
    }
    return null;
}
function addPercentageToTweet(tweet, ProfileName, FollowersNum) {
    const tweetSelectors = [
        `[data-testid="reply"]`,
        `[data-testid="retweet"]`,
        `[data-testid="like"]`,
        `[href^="/${ProfileName}/status/"][href$="/analytics"]`,
    ];
    // get the span that have the text
    function findInnermostTextNode(element) {
        let innermostTextNode = null;
        // Recursive function to traverse the DOM tree
        function traverse(node) {
            var _a;
            if (node instanceof Text && ((_a = node.textContent) === null || _a === void 0 ? void 0 : _a.trim()) !== "") {
                innermostTextNode = node;
            }
            else if (node instanceof HTMLElement &&
                node.childNodes.length > 0) {
                // Continue traversing child nodes
                node.childNodes.forEach(traverse);
            }
        }
        traverse(element);
        return innermostTextNode;
    }
    tweetSelectors.forEach((selector) => {
        const element = tweet.querySelector(selector);
        if (element) {
            const tweetNum = extractNumberFromString(element.textContent || "");
            const percentage = calculatePercentage(tweetNum, FollowersNum);
            if (percentage) {
                const innerTextTextNode = findInnermostTextNode(element);
                if (innerTextTextNode) {
                    element.classList.add("Reach-Ratio");
                    innerTextTextNode.textContent = percentage;
                }
            }
        }
    });
}
// ? return the profile name form url (the first path)
function handleUrl(url) {
    let page_URL = new URL(url);
    let pathName = page_URL.pathname;
    const urlPateLevels = pathName.split("/");
    let ProfileName = urlPateLevels[urlPateLevels.length - 1];
    return ProfileName;
}
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
    // Check if the input string contains a 'K', 'M', 'B', or 'T' suffix
    if (/\b[KkMmBbTt]\b/.test(inputString)) {
        return convertToNumber(inputString);
    }
    const extractedNumber = parseInt(inputString.replace(/\D/g, ""), 10) || 0;
    return extractedNumber;
}
// ? Converts a string representation of a number with optional suffixes (K, M, B, T) into a numeric value.
function convertToNumber(input) {
    // Rgx to match the number pattern and optional suffixes
    const regex = /^(\d+(\.\d+)?)\s*([KkMmBbTt])?$/;
    const match = input.match(regex);
    if (match) {
        const baseNumber = parseFloat(match[1]);
        const multiplier = (() => {
            switch ((match[3] || "").toUpperCase()) {
                case "K":
                    return 1000;
                case "M":
                    return 1000000;
                case "B":
                    return 1000000000;
                case "T":
                    return 1000000000000;
                default:
                    return 1;
            }
        })();
        return baseNumber * multiplier;
    }
    return 0;
}
function calculatePercentage(engagementNum, followerNum) {
    if (engagementNum === 0 || followerNum === 0) {
        return null;
    }
    let percentage = Math.ceil((engagementNum / followerNum) * 100);
    if (percentage < 1) {
        return "1%";
    }
    return `${percentage}%`;
}
// // TODO: save followers num in the extension storage
// // TODO: know your in the profile page
// // TODO: get user name from the url
// // TODO: get follower num
// // TODO: get like num in each post
// // TODO: make the % and replace it
// // take a break (leetCode and freelance)
// // TODO: 1- #Bug, fix the father.querySelector error
// // TODO: #Bug fix the 123K return 123 not 123000 (use the aria or make a function)
// // TODO: retweet vs tweet vs the not tweet things
// // TODO: make it look good
// // TODO: #Bug, when a tweet is already loaded it doesn't work
// // TODO: #Bug, the first tweet duplicate
// TODO: make the code smaller and easer to read (handlePageUpdate)
// TODO: + add options
// TODO: + add an option for every way % can be (what happen if less than 1%, ...)
// TODO: + save the % in the extension storage
// TODO: + get Followers num when not in the profile page
