import React, { useState, useEffect, useCallback } from "react";
import ReactDOM from "react-dom/client";
import { Readability } from "@mozilla/readability";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "../theme/theme";
import SummarySidebar from "../components/SummarySidebar";

export interface Message {
  role: "user" | "model" | "system";
  content: string;
}

const rootEl = document.createElement("div");
rootEl.id = "smart-read-root";
document.body.appendChild(rootEl);
const shadowRoot = rootEl.attachShadow({ mode: "open" });
const appContainer = document.createElement("div");
shadowRoot.appendChild(appContainer);
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href =
  "https://fonts.googleapis.com/css?family=Inter:300,400,500,700&display=swap";
shadowRoot.appendChild(fontLink);

const ContentScriptApp = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [pageContext, setPageContext] = useState<string>("");

  const fetchSummary = useCallback((articleContent: string) => {
    setIsLoading(true);
    setMessages([]);
    chrome.runtime.sendMessage(
      { type: "summarize", content: articleContent },
      (response) => {
        if (response.error) {
          setMessages([{ role: "system", content: response.error }]);
        } else {
          setMessages([{ role: "model", content: response.summary }]);
        }
        setIsLoading(false);
      }
    );
  }, []);

  const handleAskQuestion = (question: string) => {
    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: question },
    ];
    setMessages(newMessages);
    setIsLoading(true);

    chrome.runtime.sendMessage(
      { type: "askQuestion", question, context: pageContext },
      (response) => {
        if (response.error) {
          setMessages([
            ...newMessages,
            { role: "system", content: response.error },
          ]);
        } else {
          setMessages([
            ...newMessages,
            { role: "model", content: response.answer },
          ]);
        }
        setIsLoading(false);
      }
    );
  };

  useEffect(() => {
    // FIX: Changed 'sender' to '_sender' because it is unused.
    const messageListener = (request: any, _sender: any, sendResponse: any) => {
      if (request.type === "toggleSummary") {
        setSidebarOpen((currentIsOpen) => {
          const newIsOpen = !currentIsOpen;
          if (newIsOpen && pageContext === "") {
            const parser = new DOMParser();
            const docCopy = parser.parseFromString(
              document.documentElement.outerHTML,
              "text/html"
            );
            const article = new Readability(docCopy).parse();
            if (article?.textContent) {
              setPageContext(article.textContent);
              fetchSummary(article.textContent);
            } else {
              setMessages([
                {
                  role: "system",
                  content: "SmartRead could not find an article on this page.",
                },
              ]);
            }
          }
          return newIsOpen;
        });
        sendResponse({ status: "Sidebar state changed" });
      }
      return true;
    };

    chrome.runtime.onMessage.addListener(messageListener);
    return () => chrome.runtime.onMessage.removeListener(messageListener);
  }, [fetchSummary, pageContext]);

  return (
    <ThemeProvider theme={theme}>
      <SummarySidebar
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
        messages={messages}
        isLoading={isLoading}
        onAskQuestion={handleAskQuestion}
        hasContext={!!pageContext}
      />
    </ThemeProvider>
  );
};

const reactRoot = ReactDOM.createRoot(appContainer);
reactRoot.render(
  <React.StrictMode>
    <ContentScriptApp />
  </React.StrictMode>
);
