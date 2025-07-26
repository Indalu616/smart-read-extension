# 🚀 SmartRead AI Extension

[![React Badge](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite Badge](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![MUI Badge](https://img.shields.io/badge/Material--UI-0081CB?style=for-the-badge&logo=mui&logoColor=white)](https://mui.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

An intelligent Chrome extension designed to boost your online reading productivity. SmartRead uses the Google Gemini API to provide instant summaries, answer questions, translate text, and clean up your reading environment.

Built with a modern tech stack including React, Vite, and Material UI, this extension is designed to be fast, scalable, and easy to use.

---

## ✨ Key Features

- **AI-Powered Summaries**: Get the key takeaways from any article without reading the whole thing. The summary is displayed in a clean, collapsible sidebar.
- **Interactive Q&A**: Ask follow-up questions about the content and get instant, context-aware answers directly from the AI.
- **Text-to-Speech**: Listen to summaries and answers read aloud with easy-to-use play, pause, and stop controls.
- **Focus Mode**: Instantly hide ads, popups, headers, and other distractions with a single click for a clean reading experience.
- **Vocabulary Builder & Translator**: Select any word or phrase on a page to instantly translate it or save it to your personal vocabulary list.
- **Minimalist Design**: A beautiful, modern UI inspired by ShadCN, built on Material UI, that gets out of your way.

_(An analytics dashboard and other features are coming soon!)_

---

## 🛠️ Installation & Setup

Follow these steps to get SmartRead up and running on your local machine.

### **Step 1: Get Your Gemini API Key**

This extension requires a Google Gemini API key to function.

1.  Visit [Google AI Studio](https://aistudio.google.com/app/apikey) to create your API key.
2.  Ensure that you have **enabled the "Gemini API"** and have **linked a billing account** in your Google Cloud project. The API has a generous free tier but requires a billing account for activation.

### **Step 2: Clone the Repository**

Open your terminal and run the following command to clone the project:

```bash
git clone [https://github.com/Indalu616/smart-read-extension.git](https://github.com/Indalu616/smart-read-extension.git)
Step 3: Install Dependencies
Navigate into the newly created project directory and install the necessary packages.

Bash

cd smart-read-extension
npm install
Step 4: Set Up Your API Key
In the root of the project, create a new file named .env.local.

Open the file and add your Gemini API key in the following format:

VITE_GEMINI_API_KEY="YOUR_API_KEY_HERE"
Note: Replace "YOUR_API_KEY_HERE" with the actual key you obtained from Google AI Studio.

Step 5: Build the Extension
Run the build command to create the production-ready extension files. This will generate a dist folder.

Bash

npm run build
Step 6: Load the Extension in Chrome
Open Google Chrome and navigate to chrome://extensions.

Enable "Developer mode" using the toggle in the top-right corner.

Click the "Load unpacked" button.

In the file selection dialog, choose the dist folder that was created in your project directory.

The SmartRead AI extension icon should now appear in your Chrome toolbar!

💡 How to Use
Summarize & Q&A:

Navigate to any online article.

Click the SmartRead AI icon in your Chrome toolbar and click "Summarize & Q&A".

The sidebar will open with a complete summary. Use the input field at the bottom to ask follow-up questions.

Click the ▶️ icon under any AI message to have it read aloud.

Focus Mode:

From the popup, click "Toggle Focus Mode" to instantly clean up the page for distraction-free reading.

Vocabulary & Translation:

Simply highlight any text on the page. A small tooltip will appear, allowing you to save the word to your vocabulary list or get an instant translation/definition.

❤️ Show Your Support
If you find this project useful or interesting, please give it a star! It helps motivate further development and makes the project more visible to others.

⭐ Star This Repository

🤝 Contributing
Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are greatly appreciated.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

Fork the Project

Create your Feature Branch (git checkout -b feature/AmazingFeature)

Commit your Changes (git commit -m 'Add some AmazingFeature')

Push to the Branch (git push origin feature/AmazingFeature)

Open a Pull Request

📄 License
This project is distributed under the MIT License. See the LICENSE file for more information.
```
