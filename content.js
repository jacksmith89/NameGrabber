console.log("Content script injected");

function normalizeString(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function extractNames(text, exceptionWords) {
    const namePattern = /\b([A-Z][a-z]+)\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\b/g;
    const names = [];
    const suffixes = ['Jr', 'Sr', 'II', 'III', 'IV', 'V'];
    const lines = text.split('\n');

    for (const line of lines) {
        let match;

        while ((match = namePattern.exec(line))) {
            const firstName = normalizeString(match[1]);
            const lastNameAndSuffix = normalizeString(match[2]).split(' ');
            const lastName = lastNameAndSuffix[0];
            const suffix = lastNameAndSuffix.length > 1 && suffixes.includes(lastNameAndSuffix[1]) ? lastNameAndSuffix[1] : null;

            const nextWords = line.slice(match.index + match[0].length).split(/\s+|(?<=\w)(?=[A-Z])/).slice(0, 2);
            const prevWords = line.slice(0, match.index).split(/\s+/).slice(-2);
            const surroundingWords = prevWords.concat(nextWords);
            const surroundingWordsNormalized = surroundingWords.map(normalizeString).map((word) => word.toLowerCase());

            if (surroundingWordsNormalized.some((word) => exceptionWords.includes(word))) {
                continue;
            }

            if (!exceptionWords.includes(firstName.toLowerCase()) && !exceptionWords.includes(lastName.toLowerCase())) {
                names.push([firstName, lastName, suffix]);
            }
        }
    }

    return names;
}

async function processNames(names) {
    let fullNameList = '';
    let firstNameList = '';
    let lastNameList = '';

    const processBatchSize = 50;
    let currentBatch = [];

    for (let i = 0; i < names.length; i++) {
        currentBatch.push(names[i]);

        if (currentBatch.length === processBatchSize || i === names.length - 1) {
            console.log(`Processing batch ${Math.ceil((i + 1) / processBatchSize)} of ${Math.ceil(names.length / processBatchSize)}`);
            await new Promise((resolve) => setTimeout(resolve, 0));
            currentBatch.forEach((name) => {
                const firstName = name[0];
                const lastName = name[1];
                const suffix = name[2];

                // Add the full name with and without the suffix
                let fullName = `${firstName} ${lastName}`;
                fullNameList += `${fullName}/${fullName.toLowerCase()}\n`;
                if (suffix) {
                    const suffixText = suffix === 'Jr' ? 'junior' : (suffix === 'Sr' ? 'senior' : suffix.toLowerCase());
                    fullName = `${firstName} ${lastName} ${suffixText}`;
                    fullNameList += `${fullName}/${fullName.toLowerCase()}\n`;
                }

                // Add first and last names
                firstNameList += `${firstName}/${firstName.toLowerCase()}\n`;
                lastNameList += `${lastName}/${lastName.toLowerCase()}\n`;
            });

            currentBatch = [];
        }
    }

    return fullNameList + '\n' + firstNameList + '\n' + lastNameList;
}

function displayNamesList(namesList) {
    console.log("Displaying names list");
    // Generate the text file and display it in a new tab
    const file = new Blob([namesList], { type: "text/plain" });
    const fileURL = URL.createObjectURL(file);
    window.open(fileURL);
}

chrome.runtime.sendMessage({ type: "getExceptionWords" }, async (response) => {
    const exceptionWords = response.exceptionWords.map(normalizeString);
    // Extract names from the web page
    console.log("Extracting names");
    const names = extractNames(document.body.innerText, exceptionWords);
    console.log("Names extracted:", names);
    // Process and organize the names
    console.log("Processing names");
    const namesList = await processNames(names);
    console.log("Names processed:", namesList);

    // Display the names list in a new tab as a text file
    console.log("Displaying names list");
    displayNamesList(namesList);
    console.log("Names list displayed");
});