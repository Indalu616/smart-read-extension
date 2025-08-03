import React, { useState, useEffect, useCallback, useRef } from "react";
import ReactDOM from "react-dom/client";
import { Readability } from "@mozilla/readability";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "../theme/theme";
import SummarySidebar from "../components/SummarySidebar";
import {
  SelectionTooltip,
  VirtualElement,
} from "../components/SelectionTooltip";
import removeMarkdown from "remove-markdown";

export interface Message {
  role: "user" | "model" | "system";
  content: string;
}

// Inject the Focus Mode CSS into the page's head
const cssFile = chrome.runtime.getURL("src/content/focus-mode.css");
const link = document.createElement("link");
link.rel = "stylesheet";
link.type = "text/css";
link.href = cssFile;
document.head.appendChild(link);

// Setup the root element and Shadow DOM for our React app
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
  // State for Sidebar & API
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [pageContext, setPageContext] = useState<string>("");

  // State for Text-to-Speech
  const [speakingState, setSpeakingState] = useState<
    "playing" | "paused" | "stopped"
  >("stopped");
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // State for Vocabulary Tooltip
  const [tooltipAnchor, setTooltipAnchor] = useState<VirtualElement | null>(
    null
  );
  const [selectedText, setSelectedText] = useState("");

  // Vocabulary Handlers
  const handleSaveWord = async (text: string): Promise<boolean> => {
    const { vocabulary = [] } = await chrome.storage.local.get("vocabulary");
    if (!vocabulary.some((item: any) => item.term === text)) {
      const newVocab = [...vocabulary, { term: text, timestamp: Date.now() }];
      await chrome.storage.local.set({ vocabulary: newVocab });
    }
    return true;
  };

  const handleTranslateRequest = (text: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { type: "translateText", text },
        (response) => {
          if (chrome.runtime.lastError) {
            return reject(chrome.runtime.lastError.message);
          }
          if (response.error) {
            return reject(response.error);
          }
          resolve(response.translation);
        }
      );
    });
  };

  // Effect Hook for Text Selection
  useEffect(() => {
    const handleMouseUp = (event: MouseEvent) => {
      if ((event.target as HTMLElement)?.closest("#smart-read-root")) return;
      setTimeout(() => {
        const selection = window.getSelection();
        const text = selection?.toString().trim() ?? "";
        if (text.length > 0 && text.length < 300) {
          const range = selection!.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          const virtualEl: VirtualElement = {
            getBoundingClientRect: () => rect,
          };
          setTooltipAnchor(virtualEl);
          setSelectedText(text);
        }
      }, 10);
    };
    const handleMouseDown = (event: MouseEvent) => {
      const popperEl = document.querySelector("[data-popper-id]");
      if (popperEl && popperEl.contains(event.target as Node)) return;
      setTooltipAnchor(null);
    };
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousedown", handleMouseDown);
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  const fetchSummary = useCallback((articleContent: string) => {
    setIsLoading(true);
    setMessages([]);
    chrome.runtime.sendMessage(
      { type: "summarize", content: articleContent },
      (r) => {
        if (r.error) setMessages([{ role: "system", content: r.error }]);
        else setMessages([{ role: "model", content: r.summary }]);
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
      (r) => {
        if (r.error)
          setMessages([...newMessages, { role: "system", content: r.error }]);
        else
          setMessages([...newMessages, { role: "model", content: r.answer }]);
        setIsLoading(false);
      }
    );
  };

  const handleSpeak = useCallback(
    (markdownText: string) => {
      const plainText = removeMarkdown(markdownText);
      if (
        speakingState === "paused" &&
        utteranceRef.current?.text === plainText
      ) {
        window.speechSynthesis.resume();
        setSpeakingState("playing");
        return;
      }
      if (
        speakingState === "playing" &&
        utteranceRef.current?.text === plainText
      ) {
        window.speechSynthesis.pause();
        setSpeakingState("paused");
        return;
      }
      window.speechSynthesis.cancel();
      const newUtterance = new SpeechSynthesisUtterance(plainText);
      newUtterance.onend = () => {
        setSpeakingState("stopped");
        utteranceRef.current = null;
      };
      utteranceRef.current = newUtterance;
      window.speechSynthesis.speak(newUtterance);
      setSpeakingState("playing");
    },
    [speakingState]
  );

  const handleStopSpeak = useCallback(() => {
    window.speechSynthesis.cancel();
    setSpeakingState("stopped");
    utteranceRef.current = null;
  }, []);

  useEffect(() => {
    if (!isSidebarOpen) {
      handleStopSpeak();
    }
  }, [isSidebarOpen, handleStopSpeak]);

  useEffect(() => {
    const messageListener = (request: any, _sender: any, sendResponse: any) => {
      if (request.type === "toggleFocusMode") {
        document.body.classList.toggle("smart-read-focus-mode");
        sendResponse({ status: "Focus mode toggled" });
        return true;
      }
      if (request.type === "toggleSummary") {
        try {
          setSidebarOpen((currentIsOpen) => {
            const newIsOpen = !currentIsOpen;
            if (newIsOpen && pageContext === "") {
              const article = new Readability(
                new DOMParser().parseFromString(
                  document.documentElement.outerHTML,
                  "text/html"
                )
              ).parse();
              if (article?.textContent) {
                setPageContext(article.textContent);
                fetchSummary(article.textContent);
              } else {
                setMessages([
                  {
                    role: "system",
                    content:
                      "SmartRead could not find an article on this page.",
                  },
                ]);
              }
            }
            return newIsOpen;
          });
          sendResponse({ status: "Sidebar toggled" });
        } catch (e) {
          console.error("SmartRead Error:", e);
          setMessages([
            {
              role: "system",
              content:
                "This page is too complex or protected, and could not be processed.",
            },
          ]);
          setSidebarOpen(true);
          sendResponse({ error: "Page processing failed" });
        }
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
        onSpeak={handleSpeak}
        onStopSpeak={handleStopSpeak}
        speakingState={speakingState}
      />
      <SelectionTooltip
        anchorEl={tooltipAnchor}
        selectedText={selectedText}
        onSave={handleSaveWord}
        onTranslate={handleTranslateRequest}
      />
    </ThemeProvider>
  );
};

const root = ReactDOM.createRoot(appContainer);
root.render(
  <React.StrictMode>
    <ContentScriptApp />
  </React.StrictMode>
);
