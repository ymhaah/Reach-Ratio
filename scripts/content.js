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
// // TODO: #Bug fix the 123K return 123 not 123000 (use the aria or make a function)
// // TODO: retweet vs tweet vs the not tweet things
// TODO: make it look good with some css
// TODO: make the code smaller and easer to read (handlePageUpdate)
// TODO: #Bug, when a tweet is already loaded it doesn't work
// TODO: #Bug, the first tweet duplicate
// TODO: + add sating
// TODO: + add an option for every way % can be (what happen if less than 1%, ...)
// TODO: + save the % in the extension storage
// TODO: + get Followers num when not in the profile page
// ? high level var (used a lot) => Name_Name
let Profile_Followers_Num = null;
let Tweet_Reply_Num = 0;
let Tweet_Retweet_Num = 0;
let Tweet_Like_Num = 0;
let Tweet_status_Num = 0;
let mainPath = "main [aria-label='Home timeline']";
// ? get url to check if in profile
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    let page_URL = new URL(request.url);
    let pathName = page_URL.pathname;
    const urlPateLevels = pathName.split("/");
    let ProfileName = urlPateLevels[urlPateLevels.length - 1];
    let ProfileFollowersNum = getFollowersNum(ProfileName);
    if (ProfileFollowersNum) {
        let tweetsArray = getTweets(ProfileName);
        console.log(tweetsArray);
        addPercentageToTweet(tweetsArray, ProfileName, ProfileFollowersNum);
    }
    // ############
    sendResponse({ ProfileName: ProfileName });
});
function getFollowersNum(ProfileName) {
    const followersElementPath = `${mainPath} a[href='/${ProfileName}/verified_followers']`;
    let loadRetries = 0;
    const maxLoadRetries = 30;
    const extractFollowers = () => {
        var _a;
        const followersElement = document.querySelector(followersElementPath);
        if (followersElement) {
            return extractNumberFromString((_a = followersElement.textContent) !== null && _a !== void 0 ? _a : "");
        }
        return null;
    };
    const pageUpdateObserver = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
            if (mutation.type === "childList") {
                const addedElement = mutation.addedNodes[0];
                if (isElementLoaded(followersElementPath, addedElement)) {
                    const followers = extractFollowers();
                    if (followers !== null) {
                        pageUpdateObserver.disconnect();
                        return followers;
                    }
                }
                else {
                    loadRetries++;
                }
                if (loadRetries > maxLoadRetries) {
                    pageUpdateObserver.disconnect();
                    return null;
                }
            }
        }
    });
    pageUpdateObserver.observe(document.body, {
        childList: true,
        subtree: true,
    });
    return extractFollowers();
}
function getTweets(ProfileName) {
    const tweetPath = "section article[data-testid='tweet']";
    const tweetsDom = document.querySelectorAll(tweetPath);
    const Tweets = new Set(tweetsDom);
    const filteredTweets = Array.from(Tweets).filter((tweet) => {
        const isAddedElementMyTweet = isElementLoaded(`[href^="/${ProfileName}/status/"][href$="/analytics"]`, tweet);
        return isAddedElementMyTweet;
    });
    const pageUpdateObserver = new MutationObserver((mutationsList, observer) => {
        mutationsList.forEach((mutation) => {
            if (mutation.type === "childList" &&
                mutation.addedNodes.length > 0) {
                const addedElement = mutation.addedNodes[0];
                const isAddedElementMyTweet = isElementLoaded(`[href^="/${ProfileName}/status/"][href$="/analytics"]`, addedElement);
                if (isAddedElementMyTweet) {
                    Tweets.add(addedElement);
                }
            }
        });
    });
    pageUpdateObserver.observe(document.body, {
        childList: true,
        subtree: true,
    });
    return Array.from(Tweets);
}
function addPercentageToTweet(tweetsArray, ProfileName, FollowersNum) {
    const tweetSelectors = [
        `[data-testid="reply"]`,
        `[data-testid="retweet"]`,
        `[data-testid="like"]`,
        `[href^="/${ProfileName}/status/"][href$="/analytics"]`,
    ];
    tweetsArray.forEach((tweet) => {
        tweetSelectors.forEach((selector) => {
            const element = tweet.querySelector(selector);
            if (element) {
                const tweetNum = extractNumberFromString(element.textContent || "");
                const percentage = calculatePercentage(tweetNum, FollowersNum);
                if (percentage) {
                    let percentageDiv = document.createElement("div");
                    percentageDiv.classList.add("Reach-Ratio");
                    // percentageDiv.setAttribute('data-engagement', percentage);
                    percentageDiv.textContent = percentage;
                    element.appendChild(percentageDiv);
                }
            }
        });
    });
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
function convertToNumber(input) {
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
