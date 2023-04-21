const defaultExceptions = [
    "Bronco",
    "Boise",
    "State",
    "University",
    "Idaho",
    "College",
    "Athletics",
    "Football",
    "Basketball",
    "Baseball",
    "Volleyball",
    "Soccer",
    "Softball",
    "Assistant",
    "Coach",
    "Associate",
    "Men",
    "Women",
    // Add more default exception words as needed
];

document.getElementById("generate").addEventListener("click", generateNamesList);
document.getElementById("save").addEventListener("click", saveExceptions);

function generateNamesList() {
    chrome.runtime.sendMessage({ action: "generateNamesList" });
}

function saveExceptions() {
    const exceptions = document
        .getElementById("exceptions")
        .value.split("\n")
        .map((word) => word.trim()); // Add trimming for each word
    chrome.storage.sync.set({ exceptions }, () => {
        alert("Exceptions saved");
    });
}

function loadExceptions() {
    chrome.storage.sync.get("exceptions", (data) => {
        if (data.exceptions) {
            document.getElementById("exceptions").value = data.exceptions.join("\n");
        } else {
            // Use default exceptions if no saved exceptions are found
            document.getElementById("exceptions").value = defaultExceptions.join("\n");
        }
    });
}


loadExceptions();
