"use strict";
// TODO: the website loading state
// contentScript.js
// Function to handle changes in the DOM
// function handleMutations(mutationsList, observer) {
//     for (const mutation of mutationsList) {
//         if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
//             // Content has been added to the DOM, now you can try to access the element
//             accessElement();
//         }
//     }
// }
// // Function to access the desired element
// // Use MutationObserver to watch for changes in the DOM
// const observer = new MutationObserver(handleMutations);
// observer.observe(document.body, { childList: true, subtree: true });
function accessElement() {
    // Find the element by its ID
    const followersNum = document.querySelector(".css-1qaijid.r-bcqeeo.r-qvutc0.r-poiln3");
    if (followersNum) {
        console.log(followersNum);
        console.log(followersNum.textContent);
    }
}
window.addEventListener("load", function () {
    accessElement();
    // Your code to run when the entire page, including external resources, has finished loading
});
