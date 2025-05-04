// popup.js - Firefox Version using browser.* API

document.addEventListener('DOMContentLoaded', () => {

    const summarizeBtn = document.getElementById('summarizeBtn');
    const summaryDiv = document.getElementById('summary');
    const statusDiv = document.getElementById('status');
    const apiKeyTutorial = document.getElementById('apiKeyTutorial');
    const showApiKeyInputBtn = document.getElementById('showApiKeyInputBtn');
    const newApiKeySection = document.getElementById('newApiKeySection');
    const newApiKeyInput = document.getElementById('newApiKeyInput');
    const saveNewApiKeyBtn = document.getElementById('saveNewApiKeyBtn');

    let accumulatedMarkdown = "";
    let currentApiKey = null;

    // --- Functions for API Key Handling ---

    async function checkApiKey() { // Added async for await
        console.log("checkApiKey: Checking storage...");
        statusDiv.textContent = "Checking for API Key...";
        statusDiv.classList.remove('error');
        summarizeBtn.disabled = true;
        hideAllViews();

        try {
            // Use browser.storage.local.get - returns a Promise
            const result = await browser.storage.local.get('geminiApiKey');

            if (result && result.geminiApiKey) { // Check if key exists in result
                console.log("checkApiKey: API Key found.");
                currentApiKey = result.geminiApiKey;
                showSummaryView();
                summarizeBtn.disabled = false;
                statusDiv.textContent = "API Key loaded. Ready to summarize.";
                if (statusDiv.textContent.includes("Ready")) {
                    summaryDiv.innerHTML = '';
                }
            } else {
                console.log("checkApiKey: API Key not found.");
                currentApiKey = null;
                showTutorialView();
                summarizeBtn.disabled = true;
                statusDiv.textContent = "Please follow the steps to get and save your Gemini API Key.";
            }
        } catch (error) {
            // Handle errors reading from storage using .catch() for Promises
            console.error("checkApiKey: Error checking storage", error);
            handleError("Error checking storage: " + error.message);
            showTutorialView(); // Show tutorial as a fallback
        }
    }

    async function saveNewApiKey() { // Added async for await
        const apiKey = newApiKeyInput.value.trim();
        if (!apiKey) {
            handleError("API Key cannot be empty.", false);
            statusDiv.textContent = "Please enter a valid API Key.";
            return;
        }

        console.log("saveNewApiKey: Saving key...");
        statusDiv.textContent = "Saving API Key...";
        saveNewApiKeyBtn.disabled = true;
        newApiKeyInput.disabled = true;

        try {
            // Use browser.storage.local.set - returns a Promise
            await browser.storage.local.set({ geminiApiKey: apiKey });

            // Save successful
            console.log("saveNewApiKey: API Key saved successfully.");
            currentApiKey = apiKey;
            showSummaryView();
            summarizeBtn.disabled = false;
            statusDiv.textContent = "API Key saved! Ready to summarize.";
            newApiKeyInput.value = '';
            summaryDiv.innerHTML = '';

        } catch (error) {
            // Handle errors saving to storage using try/catch with async/await
            console.error("saveNewApiKey: Error saving key", error);
            handleError("Error saving API Key: " + error.message, false);
        } finally {
            // Re-enable input controls regardless of outcome
            saveNewApiKeyBtn.disabled = false;
            newApiKeyInput.disabled = false;
        }
    }

    // --- UI State Management Functions (No API calls, remain the same) ---

    function hideAllViews() {
        apiKeyTutorial.style.display = 'none';
        apiKeyTutorial.classList.remove('tutorial-visible');
        newApiKeySection.style.display = 'none';
        summaryDiv.style.display = 'none';
        summaryDiv.classList.remove('summary-visible');
    }

    function showTutorialView() {
        hideAllViews();
        apiKeyTutorial.style.display = 'flex';
        console.log("UI State: Showing Tutorial View");
    }

    function showInputView() {
        hideAllViews();
        newApiKeySection.style.display = 'block';
        statusDiv.textContent = "Paste your API Key below and click Save.";
        newApiKeyInput.focus();
        console.log("UI State: Showing Input View");
    }

    function showSummaryView() {
        hideAllViews();
        summaryDiv.style.display = 'block';
        setTimeout(() => {
            summaryDiv.classList.add('summary-visible');
        }, 10);
        summarizeBtn.disabled = !currentApiKey;
        console.log("UI State: Showing Summary View");
    }

    // --- Event Listeners (Remain the same logic) ---

    showApiKeyInputBtn.addEventListener('click', showInputView);
    saveNewApiKeyBtn.addEventListener('click', saveNewApiKey);

    summarizeBtn.addEventListener('click', async () => { // Added async
        console.log("Summarize button clicked.");
        if (!currentApiKey) {
            console.warn("Summarize click: API Key missing.");
            handleError("API Key is missing. Please save your key first.", false);
            showInputView();
            return;
        }

        resetSummaryArea();
        statusDiv.textContent = 'Requesting page content extraction...';
        summarizeBtn.disabled = true;

        try {
            // Use browser.tabs.query - returns a Promise
            const tabs = await browser.tabs.query({ active: true, currentWindow: true });

            if (!tabs || tabs.length === 0 || !tabs[0].id) {
                 throw new Error('Active tab not found or missing ID.'); // Throw error for catch block
            }
            const activeTab = tabs[0];

            if (!activeTab.url || activeTab.url.startsWith('chrome://') || activeTab.url.startsWith('about:') || activeTab.url.startsWith('moz-extension://') || activeTab.url.startsWith('file://') || activeTab.url.includes('addons.mozilla.org')) { // Added Firefox specific schemes
                const errorMsg = "Cannot summarize this type of page (e.g., browser settings, local files, Add-ons page).";
                console.warn("Summarize click:", errorMsg);
                handleError(errorMsg); // Use handleError to reset state
                return; // Stop execution for this case
            }

            console.log("Summarize click: Injecting content script into tab:", activeTab.id);
             // Use browser.scripting.executeScript - returns a Promise
            await browser.scripting.executeScript({
                target: { tabId: activeTab.id },
                files: ['content.js']
            });
            console.log("Summarize click: Content script injected successfully.");

        } catch (error) {
             // Handle errors getting tab or injecting script
            const errorMsg = `Operation failed: ${error.message}. Try reloading the page.`;
            console.error("Summarize click: Error in query/injection", errorMsg, error);
            handleError(errorMsg); // Show error and reset state
        }
    });


    // --- Message Handling ---

    // Use browser.runtime.onMessage
    browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
        console.log("Popup: Received message - Action:", request.action);

        switch (request.action) {
            case "extractedText":
                if (!currentApiKey) {
                    console.error("Message 'extractedText': API Key missing!");
                    handleError("API Key became missing before summarization could start.");
                    return false; // Stop processing this message
                }
                statusDiv.textContent = 'Content extracted. Requesting summary...';
                showSummaryView();

                console.log("Message 'extractedText': Sending 'summarizeText' to background.");
                // Use browser.runtime.sendMessage
                browser.runtime.sendMessage({
                    action: "summarizeText",
                    text: request.text,
                    apiKey: currentApiKey
                }).catch(error => { // Add catch for potential errors sending message
                     console.error("Error sending summarizeText message:", error);
                     handleError(`Failed to send request to background: ${error.message}`);
                 });
                break;

            case "extractionError":
                console.error("Message 'extractionError':", request.error);
                handleError(request.error || "Failed to extract text from the page.");
                showSummaryView();
                break;

            case "summaryChunk":
                if (summaryDiv.style.display !== 'block') {
                     console.warn("Message 'summaryChunk': Received chunk but summary view is hidden. Ignoring.");
                     return false;
                }
                if (!statusDiv.classList.contains('error')) {
                    statusDiv.textContent = 'Summarizing... (streaming)';
                }

                accumulatedMarkdown += request.chunk;
                try {
                    const dirtyHtml = marked.parse(accumulatedMarkdown);
                    summaryDiv.innerHTML = dirtyHtml;

                    // Force Smooth Scroll Logic
                    summaryDiv.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'end' });

                } catch (e) {
                    console.error("Message 'summaryChunk': Error parsing/rendering markdown:", e);
                    const textNode = document.createTextNode(request.chunk);
                    summaryDiv.appendChild(textNode);
                    handleError('Error rendering summary formatting.', false);
                }
                break;

            case "summaryComplete":
                console.log("Message 'summaryComplete': Summary finished.");
                 if (!statusDiv.classList.contains('error')) {
                    statusDiv.textContent = 'Summary complete.';
                 }
                summarizeBtn.disabled = false;

                 if (summaryDiv.innerHTML.trim() === "" || summaryDiv.textContent.trim() === "") {
                    console.log("Message 'summaryComplete': Summary appears empty.");
                    summaryDiv.innerHTML = "<p><i>Summary generation finished, but the result was empty.</i></p>";
                 }
                break;

            case "summaryResult":
                console.log("Message 'summaryResult': Success -", request.success, "Error -", request.error);
                if (!request.success) {
                    if (request.error && (request.error.includes("API key not valid") || request.error.includes("API key is invalid"))) {
                        handleApiError(request.error);
                    } else {
                        handleError(request.error || "An unknown error occurred during summarization.");
                    }
                    showSummaryView();
                }
                break;

            default:
                console.warn("Popup: Received unknown message action:", request.action);
                break;
        }
        // For message listeners in Firefox, returning true for async is less common,
        // Promises are preferred. Returning false or nothing is usually fine.
        // return false; // Explicitly synchronous
    });


    // --- UI Helper Functions ---

    function resetSummaryArea() {
        console.log("resetSummaryArea: Clearing summary display.");
        accumulatedMarkdown = "";
        summaryDiv.innerHTML = '';
        statusDiv.classList.remove('error');
        showSummaryView();
    }

    function handleError(errorMessage, clearSummary = true) {
        console.error("handleError:", errorMessage);
        statusDiv.textContent = `Error: ${errorMessage}`;
        statusDiv.classList.add('error');

        if (summaryDiv.style.display !== 'block') {
             showSummaryView();
        }

        const safeErrorMessage = marked.parseInline(errorMessage || 'Unknown Error')
                                    .replace(/<p>|<\/p>/g, '');

        const errorContent = `<p style="color: var(--error-color);"><i>Error: ${safeErrorMessage}</i></p>`;

        if (clearSummary) {
            summaryDiv.innerHTML = errorContent;
            accumulatedMarkdown = "";
        } else {
            const errorP = document.createElement('p');
            errorP.style.color = 'var(--error-color)';
            errorP.style.borderTop = '1px dashed var(--error-color)';
            errorP.style.marginTop = '10px';
            errorP.style.paddingTop = '10px';
            errorP.innerHTML = `<i>Processing Error: ${safeErrorMessage}</i>`;
            summaryDiv.appendChild(errorP);
            errorP.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }

        summarizeBtn.disabled = !currentApiKey;
        saveNewApiKeyBtn.disabled = false;
    }

    async function handleApiError(errorMessage) { // Added async
        console.error("handleApiError:", errorMessage);
        statusDiv.textContent = `API Error: Please check and save your key.`;
        statusDiv.classList.add('error');

        summaryDiv.innerHTML = `<p style="color: var(--error-color);"><i>Invalid API Key. Please save a valid key.</i></p>`;
        showSummaryView();

        accumulatedMarkdown = "";
        currentApiKey = null;
        summarizeBtn.disabled = true;

        try {
             // Use browser.storage.local.remove - returns a Promise
            await browser.storage.local.remove('geminiApiKey');
            console.log("handleApiError: Invalid API key removed from storage.");
        } catch (error) {
             console.error("handleApiError: Failed to remove invalid key from storage:", error);
             // Update status to reflect this secondary error?
             statusDiv.textContent += " (Could not remove invalid key from storage)";
        }
    }


    // --- Initial Setup ---
    checkApiKey(); // Start the process when the popup loads

});