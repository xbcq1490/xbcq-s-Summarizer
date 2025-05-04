# xbcq's Summarizer - Browser Extension

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A browser extension for Chrome and Firefox that summarizes the content of the current webpage using Google's Gemini API.

![Extension Popup Screenshot](<INSERT_SCREENSHOT_URL_HERE>) _<-- Optional: Replace with a link to a screenshot_

## Description

This extension provides a convenient way to get quick summaries of web articles, blog posts, or other text-heavy pages. It leverages the power of Google's Gemini large language models by sending the page content directly to the Gemini API using **your own API key**. The summary is then streamed back and displayed directly in the extension's popup with Markdown formatting.

## Features

* **One-Click Summarization:** Summarize the active tab with a single button press.
* **Gemini Powered:** Utilizes Google's Gemini API for high-quality summaries (requires user's own API key).
* **Streaming Output:** Summaries are streamed word-by-word for a responsive feel.
* **Markdown Formatting:** Displays summaries with clear formatting (headings, lists, bold, etc.).
* **Secure API Key Storage:** Stores your Gemini API key securely in local browser storage (`storage.local`). Your key is *only* sent to Google's API and never to the developer.
* **Built-in Tutorial:** Guides users on how to obtain their free Google Gemini API key.
* **Cross-Browser:** Compatible with both Google Chrome (Manifest V3) and Mozilla Firefox (Manifest V3).
* **Privacy Focused:** Page content is sent directly to Google for summarization and is not stored or collected by the developer.

## Installation

**From Stores (Recommended when available):**

* **Chrome:** _[Link to Chrome Web Store listing - Add when published]_
* **Firefox:** _[Link to Firefox Add-ons listing - Add when published]_

**From Source (For Developers):**

1.  **Download:** Clone this repository or download the source code as a ZIP file.
2.  **Choose Version:** Navigate into either the `GeminiSummarizer` (for Chrome) or `GeminiSummarizer-Firefox` folder.
3.  **Load Extension:**
    * **Chrome:**
        * Open Chrome and go to `chrome://extensions/`.
        * Enable "Developer mode" (top-right toggle).
        * Click "Load unpacked".
        * Select the chosen version folder (e.g., `GeminiSummarizer`).
    * **Firefox:**
        * Open Firefox and go to `about:debugging#/runtime/this-firefox`.
        * Click "Load Temporary Add-on...".
        * Navigate into the chosen version folder (e.g., `GeminiSummarizer-Firefox`) and select the `manifest.json` file.

## Usage

1.  **Get API Key:**
    * The first time you open the extension popup, you will see a tutorial.
    * Follow the steps to visit the [Google AI Studio](https://aistudio.google.com/app/apikey) and create a free Gemini API key.
    * Copy the generated key.
2.  **Save API Key:**
    * Click the "I have it" button in the extension popup.
    * Paste your API key into the input field and click "Save". The key will be stored locally and securely.
3.  **Summarize:**
    * Navigate to a webpage you want to summarize.
    * Click the xbcq's Summarizer icon in your browser toolbar.
    * Click the "Summarize Page" button.
    * The summary will stream into the popup window.

## Technology Stack

* HTML, CSS, JavaScript
* WebExtensions API (Manifest V3)
* Google Gemini API
* [marked.js](https://github.com/markedjs/marked) (For Markdown parsing)
* _[Optional: Add DOMPurify if you implemented it]_ [DOMPurify](https://github.com/cure53/DOMPurify) (For HTML sanitization)

## Privacy

This extension prioritizes user privacy:

* Your Gemini API key is stored **only** locally on your device using `storage.local`.
* Webpage content is sent **only** to the Google Gemini API for summarization when you initiate the action.
* Neither your API key nor webpage content is ever sent to or stored by the developer of this extension.

For full details, please see the [Privacy Policy](<LINK_TO_PRIVACY_POLICY.md_OR_HOSTED_URL>). _<-- Replace with link_

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details. This means you are free to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the software, provided the original copyright notice and license permission notice are included.

## Contributing

Contributions are welcome! If you find a bug or have a feature request, please open an issue on the GitHub repository. If you'd like to contribute code, please fork the repository and submit a pull request.

## Support / Contact

If you encounter issues or have questions, please open an issue on the GitHub repository: _[Link to GitHub Issues page]_

You can also contact the developer at: _[Your Contact Email or Link]_
