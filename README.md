# xbcq's Summarizer - Browser Extension

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A browser extension for Firefox that summarizes the content of the current webpage using Google's Gemini API.

![Extension Popup Screenshot](https://github.com/xbcq1490/xbcq-s-Summarizer/blob/main/docs/screenshot.png?raw=true)

## Description

This extension provides a convenient way to get quick summaries of web articles, blog posts, or other text-heavy pages. It leverages the power of Google's Gemini large language models by sending the page content directly to the Gemini API using **your own API key**. The summary is then streamed back and displayed directly in the extension's popup with Markdown formatting.

## Features

* **One-Click Summarization:** Summarize the active tab with a single button press.
* **Gemini Powered:** Utilizes Google's Gemini API for high-quality summaries (requires user's own API key).
* **Streaming Output:** Summaries are streamed word-by-word for a responsive feel.
* **Markdown Formatting:** Displays summaries with clear formatting (headings, lists, bold, etc.).
* **Secure API Key Storage:** Stores your Gemini API key securely in local browser storage (`storage.local`). Your key is *only* sent to Google's API and never to the developer.
* **Built-in Tutorial:** Guides users on how to obtain their free Google Gemini API key.
* **Cross-Browser:** Compatible with Mozilla Firefox (Manifest V3).
* **Privacy Focused:** Page content is sent directly to Google for summarization and is not stored or collected by the developer.

## Installation

**From Source (For Developers):**

1.  **Download:** Clone this repository or download the source code as a ZIP file.
2.  **Choose Version:** Navigate into either the `xbcqsSummarizer` folder.
3.  **Load Extension:**
    * **Firefox:**
        * Open Firefox and go to `about:debugging#/runtime/this-firefox`.
        * Click "Load Temporary Add-on...".
        * Navigate into your downloads folder and select the ZIP file.

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
* marked.js

## Privacy

This extension prioritizes user privacy:

* Your Gemini API key is stored **only** locally on your device using `storage.local`.
* Webpage content is sent **only** to the Google Gemini API for summarization when you initiate the action.
* Neither your API key nor webpage content is ever sent to or stored by the developer of this extension.

For full details, please see the [Privacy Policy](https://raw.githubusercontent.com/xbcq1490/xbcq-s-Summarizer/refs/heads/main/docs/privacy-policy.txt).

## License

This project is licensed under the **MIT License**. See the [LICENSE](https://raw.githubusercontent.com/xbcq1490/xbcq-s-Summarizer/refs/heads/main/LICENSE) file for details. This means you are free to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the software, provided the original copyright notice and license permission notice are included.

## Contributing

Contributions are welcome! If you find a bug or have a feature request, please open an issue on the GitHub repository. If you'd like to contribute code, please fork the repository and submit a pull request.

## Support / Contact

If you encounter issues or have questions, please open an issue on the GitHub repository: [Issues](https://github.com/xbcq1490/xbcq-s-Summarizer/issues)

You can also contact the developer at: xbcq.mail@icloud.com
