// src/components/SummarySidebar.tsx
import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Paper,
  CircularProgress,
  Link,
  TextField,
  InputAdornment,
  Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline";
import StopCircleIcon from "@mui/icons-material/StopCircle";
import { Message } from "../content/content-script";

// Props for the main sidebar component
interface SummarySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
  isLoading: boolean;
  onAskQuestion: (question: string) => void;
  hasContext: boolean;
  // New props for TTS
  onSpeak: (text: string) => void;
  onStopSpeak: () => void;
  speakingState: "playing" | "paused" | "stopped";
}

// Reusable component for the Q&A input form
const QnAInput: React.FC<{ onAsk: (q: string) => void; disabled: boolean }> = ({
  onAsk,
  disabled,
}) => {
  const [query, setQuery] = useState("");
  const handleSend = () => {
    if (query.trim()) {
      onAsk(query.trim());
      setQuery("");
    }
  };
  return (
    <Box sx={{ p: 1, borderTop: 1, borderColor: "divider" }}>
      <TextField
        placeholder="Ask a follow-up question..."
        variant="outlined"
        fullWidth
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        disabled={disabled}
        InputProps={{
          sx: { borderRadius: 3, fontSize: "0.9rem" },
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={handleSend}
                edge="end"
                color="primary"
                disabled={disabled || !query.trim()}
              >
                <SendIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
};

// NEW component for TTS player controls
const PlayerControls: React.FC<{
  messageContent: string;
  onSpeak: (text: string) => void;
  onStop: () => void;
  speakingState: "playing" | "paused" | "stopped";
}> = ({ messageContent, onSpeak, onStop, speakingState }) => {
  const handlePlayPause = () => {
    onSpeak(messageContent); // This function will intelligently handle play/pause
  };

  return (
    <Box sx={{ mt: 1, display: "flex", alignItems: "center", gap: 0.5 }}>
      <Tooltip title={speakingState === "playing" ? "Pause" : "Play"}>
        <IconButton
          size="small"
          onClick={handlePlayPause}
          sx={{ color: "text.secondary" }}
        >
          {speakingState === "playing" ? (
            <PauseCircleOutlineIcon />
          ) : (
            <PlayCircleOutlineIcon />
          )}
        </IconButton>
      </Tooltip>
      <Tooltip title="Stop">
        <IconButton
          size="small"
          onClick={onStop}
          sx={{ color: "text.secondary" }}
          disabled={speakingState === "stopped"}
        >
          <StopCircleIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

// Main Sidebar Component
const SummarySidebar: React.FC<SummarySidebarProps> = ({
  isOpen,
  onClose,
  messages,
  isLoading,
  onAskQuestion,
  hasContext,
  onSpeak,
  onStopSpeak,
  speakingState,
}) => {
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [activeMessage, setActiveMessage] = useState(""); // Track which message is playing

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // When speech stops from any source, reset the active message
  useEffect(() => {
    if (speakingState === "stopped") {
      setActiveMessage("");
    }
  }, [speakingState]);

  const handleSpeak = (text: string) => {
    // If the same message is clicked, it's a play/pause action
    // If a new message is clicked, it stops the old one and starts the new one
    if (activeMessage === text && speakingState !== "stopped") {
      onSpeak(text); // Let the parent handle pause/resume
    } else {
      onStopSpeak(); // Stop any current speech
      setActiveMessage(text);
      onSpeak(text); // Start speaking the new text
    }
  };

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={onClose}
      sx={{
        "& .MuiDrawer-paper": {
          width: "420px",
          boxSizing: "border-box",
          backgroundColor: "transparent",
          boxShadow: "none",
          border: "none",
        },
      }}
    >
      <Paper
        sx={{
          m: 2,
          height: "calc(100% - 32px)",
          display: "flex",
          flexDirection: "column",
          borderRadius: 4,
          backgroundColor: "background.paper",
          overflow: "hidden",
        }}
        elevation={0}
      >
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            SmartRead Q&A
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>
          {messages.map((msg, index) => (
            <Box key={index} sx={{ mb: 2 }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 3,
                  bgcolor:
                    msg.role === "user"
                      ? "primary.main"
                      : msg.role === "system"
                      ? "error.lighter"
                      : "action.hover",
                  color:
                    msg.role === "user"
                      ? "primary.contrastText"
                      : "text.primary",
                }}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: (props) => (
                      <Typography variant="body2" paragraph {...props} />
                    ),
                    li: ({ ...props }) => (
                      <li {...props} style={{ marginBottom: "4px" }} />
                    ),
                    a: (props) => (
                      <Link
                        target="_blank"
                        rel="noopener"
                        sx={{
                          color: msg.role === "user" ? "#fff" : "primary.main",
                        }}
                        {...props}
                      />
                    ),
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              </Box>
              {/* Add player controls only for AI model responses */}
              {msg.role === "model" && (
                <PlayerControls
                  messageContent={msg.content}
                  onSpeak={handleSpeak}
                  onStop={onStopSpeak}
                  speakingState={
                    activeMessage === msg.content ? speakingState : "stopped"
                  }
                />
              )}
            </Box>
          ))}
          {isLoading && (
            <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}
          <div ref={chatEndRef} />
        </Box>

        <QnAInput onAsk={onAskQuestion} disabled={!hasContext || isLoading} />
      </Paper>
    </Drawer>
  );
};

export default SummarySidebar;
