// contentScript.js

// // TODO: save followers num in the extension storage
// // TODO: know your in the profile page
// // TODO: get user name from the url
// // TODO: get follower num
// TODO: get like num in each post
// TODO: make the % and replace it
// TODO: + save the % in the extension storage
// TODO: + make it stop when he click the icon
// TODO: + add more functionality (not just the like num)
// TODO: + add more seating

// ? high level var (used a lot) => Name_Name

let Profile_Name: string | null;
let Profile_Followers_Num: number | null = null;

let mainPath = "main [aria-label='Home timeline']";

let loadRetries: number = 0;
let maxLoadRetries: number = 20;

// ? Process the message and send a response back if needed
chrome.runtime.onMessage.addListener(
    async (request: { url: string }, sender, sendResponse) => {
        let page_URL = new URL(request.url);
        let pathName = page_URL.pathname;
        const urlPateLevels = pathName.split("/");

        // ! will only by the right name in the profile page if you want use.
        Profile_Name = urlPateLevels[urlPateLevels.length - 1];

        // const response = { Profile_Name: Profile_Name };
        // sendResponse(response);
    }
);

async function isElementLoaded(elementPath: string): Promise<boolean> {
    let element = document.querySelector(elementPath);

    if (element) {
        return true;
    } else {
        return false;
    }
}

function extractNumberFromString(inputString: string): number | null {
    const extractedNumber =
        parseInt(inputString.replace(/\D/g, ""), 10) || null;
    return extractedNumber;
}

async function handlePageUpdate(
    mutationsList: MutationRecord[],
    observer: MutationObserver
) {
    for (const mutation of mutationsList) {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
            loadRetries++;

            // ? if this element exist than you are in the profile page (unique to the profile page)
            const isProfilePage = await isElementLoaded(
                `${mainPath} a[href='/${Profile_Name}/header_photo']`
            );

            if (isProfilePage && !Profile_Followers_Num) {
                // ? when the profile page is loaded and we still does not know the follower num

                const isFollowersLoaded = await isElementLoaded(
                    `${mainPath} a[href='/${Profile_Name}/verified_followers']`
                );

                if (isFollowersLoaded) {
                    let followers = document.querySelector(
                        `${mainPath} a[href='/${Profile_Name}/verified_followers']`
                    );
                    Profile_Followers_Num = extractNumberFromString(
                        followers?.textContent as string
                    );
                }
            }
        }
    }
}
const pageUpdateObserver = new MutationObserver(handlePageUpdate);

pageUpdateObserver.observe(document.body, { childList: true, subtree: true });
if (loadRetries > maxLoadRetries && !Profile_Followers_Num) {
    pageUpdateObserver.disconnect();
}
