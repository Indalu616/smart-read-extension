// src/components/SelectionTooltip.tsx
import React, { useState } from "react";
import {
  Popper,
  Paper,
  IconButton,
  Divider,
  Typography,
  CircularProgress,
  Box,
  Tooltip,
} from "@mui/material";
import AddTaskIcon from "@mui/icons-material/AddTask";
import GTranslateIcon from "@mui/icons-material/GTranslate";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export type VirtualElement = {
  getBoundingClientRect: () => DOMRect;
};

interface SelectionTooltipProps {
  anchorEl: VirtualElement | null;
  selectedText: string;
  onSave: (text: string) => Promise<boolean>;
  onTranslate: (text: string) => Promise<string>;
}

export const SelectionTooltip: React.FC<SelectionTooltipProps> = ({
  anchorEl,
  selectedText,
  onSave,
  onTranslate,
}) => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [translation, setTranslation] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  // --- THIS IS THE FIX ---
  // We wrap the async call in a try/catch block to handle API errors gracefully.
  const handleTranslateClick = async () => {
    setIsTranslating(true);
    setTranslation("");
    try {
      const result = await onTranslate(selectedText);
      setTranslation(result);
    } catch (error) {
      console.error("Translation Error:", error);
      setTranslation(String(error) || "Translation failed.");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSaveClick = async () => {
    await onSave(selectedText);
    setIsSaved(true);
  };

  React.useEffect(() => {
    setTranslation("");
    setIsSaved(false);
  }, [selectedText]);

  const open = Boolean(anchorEl);

  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement="top"
      transition
      sx={{ zIndex: 2147483647 }}
    >
      <Paper
        sx={{
          p: 0.5,
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          borderRadius: 3,
          flexWrap: "wrap",
        }}
        elevation={3}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            width: "100%",
          }}
        >
          <Tooltip title="Translate">
            <IconButton size="small" onClick={handleTranslateClick}>
              <GTranslateIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem />

          <Tooltip title="Save to Vocabulary">
            <span>
              <IconButton
                size="small"
                onClick={handleSaveClick}
                disabled={isSaved}
              >
                {isSaved ? (
                  <CheckCircleIcon fontSize="small" color="success" />
                ) : (
                  <AddTaskIcon fontSize="small" />
                )}
              </IconButton>
            </span>
          </Tooltip>
        </Box>

        {(isTranslating || translation) && (
          <Box
            sx={{
              borderTop: 1,
              borderColor: "divider",
              p: 1,
              mt: 1,
              width: "100%",
              maxWidth: 250,
            }}
          >
            {isTranslating ? (
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <CircularProgress size={20} />
              </Box>
            ) : (
              <Typography
                variant="caption"
                sx={{ fontStyle: "italic", display: "block" }}
              >
                {translation}
              </Typography>
            )}
          </Box>
        )}
      </Paper>
    </Popper>
  );
};
