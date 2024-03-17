// contentScript.js

let Tweets: Set<Element> = new Set();

let ProfileName = handleUrl(window.location.href);

let ProfileFollowersNum: number | null = null;

let loadRetries = 0;
const maxLoadRetries = 30;

const mainPath = "main [aria-label='Home timeline']";
const tweetPath = "section article[data-testid='tweet']";
const followersElementPath = `${mainPath} a[href='/${ProfileName}/verified_followers']`;

// ? update profile name
chrome.runtime.onMessage.addListener(
    (request: { url: string }, sender, sendResponse) => {
        ProfileName = handleUrl(request.url);

        ProfileFollowersNum = getFollowersNum(ProfileName);

        if (ProfileFollowersNum) {
            getTweetsDom(ProfileName);
            addPercentageToTweet(Tweets, ProfileName, ProfileFollowersNum);
        }

        sendResponse({ ProfileName: ProfileName });
    }
);

function getTweetsDom(ProfileName: string) {
    let tweetArr = Array.from(document.querySelectorAll(tweetPath)).filter(
        (tweet: Element) => {
            const isAddedElementMyTweet = isElementLoaded(
                `[href^="/${ProfileName}/status/"][href$="/analytics"]`,
                tweet
            );
            return isAddedElementMyTweet && tweet;
        }
    );
    tweetArr.forEach((tweet) => {
        Tweets.add(tweet);
    });
}
getTweetsDom(ProfileName);

const pageUpdateObserver = new MutationObserver(
    (mutationsList: MutationRecord[]) => {
        for (const mutation of mutationsList) {
            if (mutation.type === "childList") {
                const addedElement = mutation.addedNodes[0] as HTMLElement;

                ProfileFollowersNum = getFollowersNum(ProfileName);

                if (ProfileFollowersNum) {
                    const isAddedElementMyTweet = isElementLoaded(
                        `[href^="/${ProfileName}/status/"][href$="/analytics"]`,
                        addedElement
                    );
                    if (isAddedElementMyTweet && addedElement) {
                        Tweets.add(addedElement);
                    }
                    addPercentageToTweet(
                        Tweets,
                        ProfileName,
                        ProfileFollowersNum
                    );
                } else {
                    loadRetries++;
                }
                if (loadRetries > maxLoadRetries) {
                    pageUpdateObserver.disconnect();
                }
            }
        }
    }
);

pageUpdateObserver.observe(document.body, {
    childList: true,
    subtree: true,
});

function getFollowersNum(ProfileName: string): number | null {
    let isProfileLoaded = isElementLoaded(followersElementPath);

    if (isProfileLoaded) {
        const followersElement = document.querySelector(followersElementPath);

        const followers = extractNumberFromString(
            followersElement?.textContent ?? ""
        );

        return followers;
    }

    return null;
}

function getTweetsObserver(ProfileName: string, tweet: Element) {}

function addPercentageToTweet(
    tweetsSet: Set<Element>,
    ProfileName: string,
    FollowersNum: number
) {
    const tweetSelectors = [
        `[data-testid="reply"]`,
        `[data-testid="retweet"]`,
        `[data-testid="like"]`,
        `[href^="/${ProfileName}/status/"][href$="/analytics"]`,
    ];

    tweetsSet.forEach((tweet) => {
        tweetSelectors.forEach((selector) => {
            const element = tweet.querySelector(selector) as HTMLElement | null;
            if (element) {
                const tweetNum = extractNumberFromString(
                    element.textContent || ""
                );
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

function handleUrl(url: string): string {
    let page_URL = new URL(url);
    let pathName = page_URL.pathname;
    const urlPateLevels = pathName.split("/");

    let ProfileName = urlPateLevels[urlPateLevels.length - 1];

    return ProfileName;
}
function isElementLoaded(
    elementPath: string,
    father?: Element | null
): boolean {
    if (father instanceof Element) {
        const element = father.querySelector(elementPath);
        return element !== null;
    } else {
        const element = document.querySelector(elementPath);
        return element !== null;
    }
}
function extractNumberFromString(inputString: string): number {
    // Check if the input string contains a 'K', 'M', 'B', or 'T' suffix
    if (/\b[KkMmBbTt]\b/.test(inputString)) {
        return convertToNumber(inputString);
    }

    const extractedNumber = parseInt(inputString.replace(/\D/g, ""), 10) || 0;
    return extractedNumber;
}
function convertToNumber(input: string): number {
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
function calculatePercentage(
    engagementNum: number,
    followerNum: number
): string | null {
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
// TODO: make it look good with some css
// TODO: make the code smaller and easer to read (handlePageUpdate)

// TODO: #Bug, when a tweet is already loaded it doesn't work
// TODO: #Bug, the first tweet duplicate

// TODO: + add sating
// TODO: + add an option for every way % can be (what happen if less than 1%, ...)
// TODO: + save the % in the extension storage
// TODO: + get Followers num when not in the profile page
