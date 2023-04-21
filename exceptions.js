document.getElementById('save').addEventListener('click', saveExceptions);

function saveExceptions() {
    const exceptions = document.getElementById('exceptions').value.split('\n');
    chrome.storage.sync.set({ exceptions }, () => {
        alert('Exceptions saved');
    });
}

function loadExceptions() {
    chrome.storage.sync.get('exceptions', (data) => {
        if (data.exceptions) {
            document.getElementById('exceptions').value = data.exceptions.join('\n');
        }
    });
}

loadExceptions();
