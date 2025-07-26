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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import { Message } from "../content/content-script";

interface SummarySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
  isLoading: boolean;
  onAskQuestion: (question: string) => void;
  hasContext: boolean;
}

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

const SummarySidebar: React.FC<SummarySidebarProps> = ({
  isOpen,
  onClose,
  messages,
  isLoading,
  onAskQuestion,
  hasContext,
}) => {
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const renderMessageContent = (msg: Message) => (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h2: (props) => (
          <Typography
            variant="h6"
            sx={{ fontWeight: "bold", mt: 2, mb: 1 }}
            {...props}
          />
        ),
        p: (props) => <Typography variant="body2" paragraph {...props} />,
        li: ({ ...props }) => <li {...props} style={{ marginBottom: "4px" }} />,
        a: (props) => (
          <Link
            target="_blank"
            rel="noopener"
            sx={{
              color: msg.role === "user" ? "#fff" : "primary.main",
              textDecoration: "underline",
            }}
            {...props}
          />
        ),
        strong: (props) => <strong {...props} />,
      }}
    >
      {msg.content}
    </ReactMarkdown>
  );

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
            <Box
              key={index}
              sx={{
                mb: 2,
                p: 1.5,
                borderRadius: 3,
                bgcolor:
                  msg.role === "user"
                    ? "primary.main"
                    : msg.role === "system"
                    ? "error.lighter"
                    : "action.hover",
                color:
                  msg.role === "user" ? "primary.contrastText" : "text.primary",
                border: msg.role === "system" ? 1 : 0,
                borderColor: "error.main",
              }}
            >
              {renderMessageContent(msg)}
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
