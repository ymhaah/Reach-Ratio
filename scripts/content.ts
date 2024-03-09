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

// ? high level var (used a lot) => Name_Name

let Profile_Name: string | null;
let Profile_Followers_Num: number | null = null;

let Tweet_Reply_Num: number | null = 0;
let Tweet_Retweet_Num: number | null = 0;
let Tweet_Like_Num: number | null = 0;
let Tweet_status_Num: number | null = 0;

let mainPath = "main [aria-label='Home timeline']";
// let tweetPath = "section article[data-testid='tweet']";

let loadRetries: number = 0;
let maxLoadRetries: number = 30;

// ? get url to check if in profile
chrome.runtime.onMessage.addListener(
    (request: { url: string }, sender, sendResponse) => {
        let page_URL = new URL(request.url);
        let pathName = page_URL.pathname;
        const urlPateLevels = pathName.split("/");

        Profile_Name = urlPateLevels[urlPateLevels.length - 1];

        const response = { Profile_Name: Profile_Name };
        sendResponse(response);
    }
);

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

function getFollowersNum(ProfileName: string) {
    const isFollowersLoaded = isElementLoaded(
        `${mainPath} a[href='/${ProfileName}/verified_followers']`
    );
    if (isFollowersLoaded) {
        let followers = document.querySelector(
            `${mainPath} a[href='/${ProfileName}/verified_followers']`
        );
        Profile_Followers_Num = extractNumberFromString(
            followers?.textContent ?? ""
        );
    }
}

function addPercentageToTweet(tweetElement: HTMLElement) {
    const tweetSelectors = [
        `[data-testid="reply"]`,
        `[data-testid="retweet"]`,
        `[data-testid="like"]`,
        `[href^="/${Profile_Name}/status/"][href$="/analytics"]`,
    ];

    for (const selector of tweetSelectors) {
        const isElementPresent = isElementLoaded(selector, tweetElement);
        if (isElementPresent) {
            const element = tweetElement.querySelector(selector) as HTMLElement;

            const tweetNum = extractNumberFromString(
                element?.textContent ?? ""
            );

            const percentage = calculatePercentage(
                tweetNum,
                Profile_Followers_Num
            );

            if (percentage && !isElementLoaded("Reach-Ratio", element)) {
                let percentageDiv = document.createElement("div");

                percentageDiv.classList.add("Reach-Ratio");

                // percentageDiv.setAttribute('data-engagement', percentage);

                percentageDiv.textContent = percentage;

                element.appendChild(percentageDiv);
            }
        }
    }
}

function handlePageUpdate(
    mutationsList: MutationRecord[],
    observer: MutationObserver
) {
    for (const mutation of mutationsList) {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
            const addedElement = mutation.addedNodes[0] as HTMLElement;

            const isProfilePage = isElementLoaded(
                `${mainPath} a[href='/${Profile_Name}/header_photo']`
            );
            if (isProfilePage) {
                const isAddedElementMyTweet = isElementLoaded(
                    `[href^="/${Profile_Name}/status/"][href$="/analytics"]`,
                    addedElement
                );
                if (isAddedElementMyTweet) {
                    getFollowersNum(Profile_Name);
                    addPercentageToTweet(addedElement);
                }
            } else {
                loadRetries++;
            }

            if (loadRetries > maxLoadRetries) {
                pageUpdateObserver.disconnect();
            }
        }
    }
}
const pageUpdateObserver = new MutationObserver(handlePageUpdate);

pageUpdateObserver.observe(document.body, {
    childList: true,
    subtree: true,
});
