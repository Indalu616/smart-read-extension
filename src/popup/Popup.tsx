import { Box, Typography, Button, Paper } from "@mui/material";
import InsightsIcon from "@mui/icons-material/Insights";
import SummarizeIcon from "@mui/icons-material/Summarize";
import "./popup.css";

const Popup = () => {
  const handleSummarizeClick = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: "toggleSummary" });
      }
    });
    window.close(); // Close popup after clicking
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
          onClick={handleSummarizeClick}
        >
          Summarize Page
        </Button>
      </Paper>
    </Box>
  );
};

export default Popup;
