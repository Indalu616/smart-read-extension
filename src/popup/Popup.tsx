// src/popup/Popup.tsx
import { Box, Typography, Button, Paper, Divider } from "@mui/material";
import InsightsIcon from "@mui/icons-material/Insights";
import SummarizeIcon from "@mui/icons-material/Summarize";
import ChromeReaderModeIcon from "@mui/icons-material/ChromeReaderMode";
import "./popup.css";

const Popup = () => {
  const sendMessageToContentScript = (message: { type: string }) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, message, () => {
          // Close the popup after the message is sent
          window.close();
        });
      }
    });
  };

  return (
    <Box sx={{ p: 2, backgroundColor: "background.default", width: 280 }}>
      <Paper sx={{ p: 2, borderRadius: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <InsightsIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6" component="h1" sx={{ fontWeight: "bold" }}>
            SmartRead AI
          </Typography>
        </Box>

        <Button
          variant="contained"
          fullWidth
          startIcon={<SummarizeIcon />}
          onClick={() => sendMessageToContentScript({ type: "toggleSummary" })}
        >
          Summarize & Q&A
        </Button>

        <Divider sx={{ my: 2 }}>Tools</Divider>

        <Button
          variant="outlined"
          fullWidth
          startIcon={<ChromeReaderModeIcon />}
          onClick={() =>
            sendMessageToContentScript({ type: "toggleFocusMode" })
          }
        >
          Toggle Focus Mode
        </Button>
      </Paper>
    </Box>
  );
};

export default Popup;
