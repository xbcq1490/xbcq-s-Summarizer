// content.js - Firefox Version (using browser.*)

(function() {
    console.log("Content script executing.");
    try {
        const mainContent = document.body.innerText || "";
  
        if (mainContent.trim().length === 0) {
            console.warn("Content script: document.body.innerText is empty.");
             // Use browser.runtime.sendMessage
             browser.runtime.sendMessage({
                 action: "extractionError",
                 error: "No text content found in document body."
             }).catch(e => console.error("Content script: Error sending extractionError message:", e)); // Add catch
        } else {
            console.log("Content script: Extracted text length:", mainContent.length);
            // Use browser.runtime.sendMessage
            browser.runtime.sendMessage({ action: "extractedText", text: mainContent })
               .catch(e => console.error("Content script: Error sending extractedText message:", e)); // Add catch
        }
  
      } catch (error) {
        console.error("Content script: Error during text extraction:", error);
         // Use browser.runtime.sendMessage
        browser.runtime.sendMessage({
            action: "extractionError",
            error: `Failed to extract text: ${error.message}`
        }).catch(e => console.error("Content script: Error sending final extractionError message:", e)); // Add catch
      }
  })();