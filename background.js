chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "generateNamesList") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                files: ["content.js"],
            });
        });
        sendResponse();
    } else if (request.type === "getExceptionWords") {
        chrome.storage.sync.get("exceptions", (data) => {
            sendResponse({ exceptionWords: data.exceptions || [] });
        });
        return true; // Required to use sendResponse asynchronously
    }
});