// background.js - Firefox Version using browser.* API

const GEMINI_MODEL = 'gemini-2.5-flash-lite';

// Use browser.runtime.onMessage
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {

  if (request.action === "summarizeText") {
    console.log("Background: Received summarizeText request.");

    const textToSummarize = request.text;
    const apiKey = request.apiKey;

    // --- Basic Validation ---
    if (!apiKey) {
      console.error("Background: API Key missing in the request.");
      // Use browser.runtime.sendMessage
      browser.runtime.sendMessage({
        action: "summaryResult",
        success: false,
        error: "API Key was missing. Please save your key in the popup."
      }).catch(e => console.error("Background: Error sending API Key missing message:", e)); // Add catch
      // No need to return true/false here in Firefox as Promises aren't expected by default
      return; // Stop processing
    }
    if (!textToSummarize || textToSummarize.trim().length === 0) {
      console.warn("Background: No text content provided to summarize.");
       // Use browser.runtime.sendMessage
      browser.runtime.sendMessage({
        action: "summaryResult",
        success: false,
        error: "No text content found on the page to summarize."
      }).catch(e => console.error("Background: Error sending No Text message:", e)); // Add catch
      return; // Stop processing
    }

    // --- Construct the Prompt ---
    const prompt = `Please summarize the following text concisely, focusing on the main points.
Use standard markdown formatting (like headings '##', lists using '*' or '-', '**bold**', '*italic*') to structure the summary clearly and improve readability.
Do not add any commentary before or after the markdown summary itself. Just provide the raw markdown.

Text to summarize:
"${textToSummarize}"`;

    // --- Call streamSummary ---
    console.log("Background: Calling streamSummary function.");
    // streamSummary returns a Promise, we can handle it asynchronously
    streamSummary(prompt, apiKey)
        .then(() => {
            console.log("Background: streamSummary finished successfully (async).");
        })
        .catch((error) => {
             // Errors during streamSummary (like fetch/API errors) are caught here
             // and should have already sent an error message to the popup.
            console.error("Background: streamSummary finished with error (async):", error.message);
        });

    // Indicate async response FOR FIREFOX (returning a Promise is the standard way)
    // Although the streamSummary handles sending messages, returning a Promise
    // from the listener can be good practice if you needed to send a direct response.
    // In this case, since streamSummary handles all responses, it might not be strictly necessary,
    // but doesn't hurt. Let's return the promise from streamSummary.
     return streamSummary(prompt, apiKey); // Return the promise
     // Correction: Returning the promise means if streamSummary *rejects*, the listener might throw an unhandled rejection
     // It's safer to call it and let IT handle sending messages, and don't return the promise here.
     // Let's call it without returning the promise.
     // streamSummary(prompt, apiKey); // Call and let it run
     // return true; // Let's try the Chrome way of indicating async, Firefox often supports this too.
  }
  // return false; // Indicate synchronous handling for other actions
});

async function streamSummary(prompt, apiKey) {
  let accumulatedText = "";
  let lastSentTextLength = 0;

  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent?key=${apiKey}&alt=sse`;

  console.log(`Background: Attempting to fetch from ${GEMINI_MODEL}...`);

  try {
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
        // Optional generationConfig
      }),
    });

    // --- Error Handling (remains largely the same, fetch is standard) ---
     if (response.status === 400 || response.status === 403) {
       let errorData;
       try {
         errorData = await response.json();
         console.error("Background: API Error (400/403) JSON:", errorData);
       } catch {
         errorData = await response.text();
         console.error("Background: API Error (400/403) Text:", errorData);
       }
       const errorMessage = JSON.stringify(errorData?.error?.message || errorData);
       if (errorMessage.includes("API key") && (errorMessage.includes("not valid") || errorMessage.includes("invalid"))) {
          throw new Error(`API key not valid. Please pass a valid API key.`);
       } else {
          throw new Error(`API Error ${response.status}: ${errorMessage}`);
       }
     } else if (!response.ok) {
       let errorData;
       try {
         errorData = await response.json();
         console.error(`Background: API Error (${response.status}) JSON:`, errorData);
       } catch {
         errorData = await response.text();
         console.error(`Background: API Error (${response.status}) Text:`, errorData);
       }
       const errorMessage = `API Error ${response.status}: ${JSON.stringify(errorData?.error?.message || errorData)}`;
       throw new Error(errorMessage);
     }
     if (!response.body) {
       console.error("Background: Response body is missing.");
       throw new Error("Response body is missing from the API response.");
     }

    // --- Process Stream (remains largely the same) ---
    console.log("Background: Starting to read stream...");
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        console.log("Background: Stream finished.");
        break;
      }
      buffer += decoder.decode(value, { stream: true });
      let lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonString = line.substring(5).trim();
          if (jsonString) {
            try {
              const jsonData = JSON.parse(jsonString);
              let currentTextChunk = "";
              if (jsonData.candidates?.[0]?.content?.parts?.[0]?.text) {
                currentTextChunk = jsonData.candidates[0].content.parts[0].text;
              } else if (jsonData.promptFeedback?.blockReason) {
                const blockMessage = `Content blocked: ${jsonData.promptFeedback.blockReason}${jsonData.promptFeedback.blockReasonMessage ? ` (${jsonData.promptFeedback.blockReasonMessage})` : ''}`;
                console.warn("Background: Content blocked -", blockMessage);
                throw new Error(blockMessage);
              } else {
                 console.warn("Background: Unexpected JSON structure in chunk:", jsonData);
              }

              if (currentTextChunk) {
                accumulatedText += currentTextChunk;
                if (accumulatedText.length > lastSentTextLength) {
                    const newTextToSend = accumulatedText.substring(lastSentTextLength);
                    console.log("Background: Sending summaryChunk (length:", newTextToSend.length, ")");
                    // Use browser.runtime.sendMessage
                    browser.runtime.sendMessage({
                      action: "summaryChunk",
                      chunk: newTextToSend
                    }).catch(e => console.error("Background: Error sending summaryChunk message:", e)); // Add catch
                    lastSentTextLength = accumulatedText.length;
                }
              }
            } catch (e) {
               if (e.message.startsWith("Content blocked:")) { throw e; }
               console.error("Background: Error parsing JSON chunk:", e, "JSON:", jsonString);
            }
          }
        }
      } // End line processing
    } // End stream reading loop

    // --- Signal Completion ---
    console.log("Background: Sending summaryComplete");
     // Use browser.runtime.sendMessage
    await browser.runtime.sendMessage({ action: "summaryComplete" }) // Added await for potential ordering
           .catch(e => console.error("Background: Error sending summaryComplete message:", e)); // Add catch

  } catch (error) {
    // --- Catch All Error Handler ---
    console.error("Background: Error during streamSummary:", error);
    console.log("Background: Sending summaryResult (error)");
     // Use browser.runtime.sendMessage
    await browser.runtime.sendMessage({ // Added await for potential ordering
      action: "summaryResult",
      success: false,
      error: error.message.includes("API key not valid")
             ? error.message
             : `Summary generation failed: ${error.message || "Unknown error"}`
    }).catch(e => console.error("Background: Error sending summaryResult message:", e)); // Add catch

    // IMPORTANT: Re-throw the error if you want the Promise returned by streamSummary to reject
    // This allows the caller (.catch in the listener) to know it failed.
    throw error;
  }
}
