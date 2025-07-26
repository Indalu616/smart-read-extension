async function handleSummarize(content: string): Promise<{ summary: string }> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey === "YOUR_API_KEY_HERE" || apiKey.length < 10) {
    throw new Error(
      "API key is not configured. Please add your key to the .env.local file."
    );
  }
  const prompt = `As an expert analyst, provide a high-quality summary of the following article.
- Use markdown for all formatting (headings, bold text, lists).
- Start with a main heading for the summary title.
- Use bold text for key terms and concepts.
- Use bullet points for key takeaways.
Here is the article content:\n\n${content}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error?.message ||
          `API request failed with status ${response.status}`
      );
    }
    const data = await response.json();
    return { summary: data.candidates[0].content.parts[0].text };
  } catch (error) {
    console.error("Error during Gemini API call:", error);
    throw new Error(
      "Failed to generate summary. Check the Service Worker console for details."
    );
  }
}

async function handleAskQuestion(
  question: string,
  context: string
): Promise<{ answer: string }> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey === "YOUR_API_KEY_HERE" || apiKey.length < 10) {
    throw new Error("API key is not configured.");
  }

  const prompt = `Based on the following article content, provide a clear and concise answer to the user's question. Use markdown for formatting.
---
ARTICLE CONTENT:
${context}
---
USER QUESTION:
${question}
---
ANSWER:`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error?.message ||
          `API request failed with status ${response.status}`
      );
    }
    const data = await response.json();
    return { answer: data.candidates[0].content.parts[0].text };
  } catch (error) {
    console.error("Error during Gemini Q&A call:", error);
    throw new Error(
      "Failed to get an answer. Check the Service Worker console for details."
    );
  }
}

chrome.runtime.onMessage.addListener(
  (request: any, _sender: any, sendResponse: any) => {
    if (request.type === "summarize") {
      handleSummarize(request.content)
        .then(sendResponse)
        .catch((error) => sendResponse({ error: error.message }));
      return true;
    } else if (request.type === "askQuestion") {
      handleAskQuestion(request.question, request.context)
        .then(sendResponse)
        .catch((error) => sendResponse({ error: error.message }));
      return true;
    }
  }
);

async function handleTranslateText(
  text: string
): Promise<{ translation: string }> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey.length < 10)
    throw new Error("API key is not configured.");

  const prompt = `Translate the following text into English. If it is already in English, define it or explain its meaning in a simple way. Provide only the single, most likely translation or definition, without any extra conversational text.\n\nText: "${text}"`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `API request failed`);
    }
    const data = await response.json();
    return { translation: data.candidates[0].content.parts[0].text };
  } catch (error) {
    console.error("Error during Gemini translation call:", error);
    throw new Error("Failed to get translation.");
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "summarize") {
    handleSummarize(request.content)
      .then(sendResponse)
      .catch((error) => sendResponse({ error: error.message }));
    return true;
  } else if (request.type === "askQuestion") {
    handleAskQuestion(request.question, request.context)
      .then(sendResponse)
      .catch((error) => sendResponse({ error: error.message }));
    return true;
  } else if (request.type === "translateText") {
    handleTranslateText(request.text)
      .then(sendResponse)
      .catch((error) => sendResponse({ error: error.message }));
    return true;
  }
});
