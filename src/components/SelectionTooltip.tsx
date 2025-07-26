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

interface SelectionTooltipProps {
  anchorEl: HTMLElement | null;
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

  const handleTranslateClick = async () => {
    setIsTranslating(true);
    setTranslation("");
    const result = await onTranslate(selectedText);
    setTranslation(result);
    setIsTranslating(false);
  };

  const handleSaveClick = async () => {
    await onSave(selectedText);
    setIsSaved(true);
  };

  // Reset state when the selected text changes
  React.useEffect(() => {
    setTranslation("");
    setIsSaved(false);
  }, [selectedText]);

  const open = Boolean(anchorEl);

  return (
    <Popper open={open} anchorEl={anchorEl} placement="top" transition>
      <Paper
        sx={{
          p: 0.5,
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          borderRadius: 3,
        }}
        elevation={3}
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

        {(isTranslating || translation) && (
          <Box
            sx={{
              borderTop: 1,
              borderColor: "divider",
              p: 1,
              mt: 1,
              width: "100%",
            }}
          >
            {isTranslating ? (
              <CircularProgress size={20} />
            ) : (
              <Typography variant="caption" sx={{ fontStyle: "italic" }}>
                {translation}
              </Typography>
            )}
          </Box>
        )}
      </Paper>
    </Popper>
  );
};
