import SelectCtrl from "@/components/forms/Select";
import { Save } from "@mui/icons-material";
import { Box, Button, MenuItem, SxProps, Theme } from "@mui/material";
import React from "react";

export interface LanguageControlsProps {
  isEdit: boolean;
  isInitialLoad: boolean;
  languagesWithStatus?: any;
  languages: any;
  methods: any;
  getLanguageOptions: () => any[];
  generateTranslation: (fields: string[]) => void;
  translationState: {
    isGenerating: boolean;
    isChecking: boolean;
  };
  selectedLanguageId: string;
  languageType: string;
  containerSx?: SxProps<Theme>;
  selectSx?: SxProps<Theme>;
  fieldsToTranslate?: string[];
  hideGenerateButton?: boolean;
}

export const LanguageControls: React.FC<LanguageControlsProps> = ({
  isEdit,
  isInitialLoad,
  languagesWithStatus,
  languages,
  methods,
  getLanguageOptions,
  generateTranslation,
  translationState,
  selectedLanguageId,
  languageType,
  containerSx = {},
  selectSx = {},
  fieldsToTranslate = ["intro_desc", "subtest_desc"],
  hideGenerateButton = false,
}) => {
  const langsLoading = (isEdit && languagesWithStatus?.loading) || (!isEdit && languages?.loading);
  const languagesReady = !langsLoading;

  // Debug log to see what selectedLanguageId is received
  console.log(
    "LanguageControls - selectedLanguageId:",
    selectedLanguageId,
    "languageType:",
    languageType
  );

  // Filter language options - simplified for generic use
  const getFilteredLanguageOptions = () => {
    return getLanguageOptions();
  };

  if (isInitialLoad) return null;

  return (
    <Box sx={{ mb: 3, px: 6, ...containerSx, display: "flex", gap: 2, width: "fit-content" }}>
      {/* Show language controls for both modes */}

      <SelectCtrl
        name="language_type"
        label="Language Type"
        control={methods.control}
        rules={{ required: "Field required" }}
        sx={{
          minWidth: 160,
          "& .MuiSelect-select": {
            transition: isInitialLoad ? undefined : "none !important",
          },
          "& .MuiFormLabel-root, & .MuiInputLabel-root": {
            transition: isInitialLoad ? undefined : "none !important",
          },
          "& .MuiOutlinedInput-notchedOutline": {
            transition: isInitialLoad ? undefined : "none !important",
          },
          "& legend": {
            transition: isInitialLoad ? undefined : "none !important",
          },
        }}
      >
        <MenuItem value="main">Main Language</MenuItem>
        <MenuItem value="sub">Sub Language (Translation)</MenuItem>
      </SelectCtrl>

      {languagesReady && (
        <SelectCtrl
          name="language_id"
          label="Language"
          control={methods.control}
          rules={{ required: "Field required" }}
          sx={{
            minWidth: 200,
            "& .MuiSelect-select": {
              transition: isInitialLoad ? undefined : "none !important",
            },
            "& .MuiFormLabel-root, & .MuiInputLabel-root": {
              transition: isInitialLoad ? undefined : "none !important",
            },
            "& .MuiOutlinedInput-notchedOutline": {
              transition: isInitialLoad ? undefined : "none !important",
            },
            "& legend": {
              transition: isInitialLoad ? undefined : "none !important",
            },
            // Disable interaction in edit mode for main language
            ...(isEdit &&
              languageType === "main" && {
                "& .MuiInputBase-root": {
                  backgroundColor: "#f5f5f5",
                  color: "#666",
                  cursor: "not-allowed",
                },
                "& .MuiSelect-select": {
                  pointerEvents: "none",
                  transition: isInitialLoad ? undefined : "none !important",
                },
                "& .MuiInputLabel-root": {
                  color: "#666",
                },
              }),
          }}
          renderValue={(selected: string) => {
            if (!selected) {
              return <span style={{ color: "#9e9e9e" }}>Please select a language</span>;
            }
            const selectedLanguage = getLanguageOptions().find(
              (lang: any) => lang.language_code === selected
            );
            return selectedLanguage
              ? `${selectedLanguage.language_name} (${selectedLanguage.language_code})${
                  isEdit && selectedLanguage.translation_status === "main" ? " - Main" : ""
                }`
              : "";
          }}
        >
          {getFilteredLanguageOptions().length === 0 ? (
            <MenuItem disabled>No languages available</MenuItem>
          ) : (
            getFilteredLanguageOptions().map((language: any) => {
              return (
                <MenuItem
                  key={language.id}
                  value={language.language_code}
                  sx={
                    !isEdit
                      ? {}
                      : (() => {
                          switch (language.translation_status) {
                            case "main":
                              return { backgroundColor: "#e3f2fd", color: "#1976d2" };
                            case "translation_exists":
                              return { backgroundColor: "#e3f2fd", color: "#1976d2" };
                            case "translation_available":
                              return {};
                            default:
                              return {};
                          }
                        })()
                  }
                >
                  {language.language_name} ({language.language_code})
                  {isEdit && language.translation_status === "main" && " - Main"}
                  {isEdit && language.translation_status === "translation_exists" && (
                    <Box
                      component="span"
                      sx={{ display: "inline-flex", alignItems: "center", ml: 1 }}
                    >
                      <Save sx={{ fontSize: 16 }} />
                    </Box>
                  )}
                </MenuItem>
              );
            })
          )}
        </SelectCtrl>
      )}

      {/* Generate Translation Button - Show in both Edit and Create modes */}
      {!hideGenerateButton && (
        <Button
          variant="contained"
          color="primary"
          onClick={() => generateTranslation(fieldsToTranslate)}
          disabled={translationState.isGenerating || translationState.isChecking}
          sx={{
            px: 3,
            py: 1.5,
            minWidth: 220,
            whiteSpace: "nowrap",
            visibility:
              languageType === "sub" && selectedLanguageId && selectedLanguageId !== ""
                ? "visible"
                : "hidden",
            ...selectSx,
          }}
        >
          {translationState.isGenerating
            ? "Generating Translation..."
            : translationState.isChecking
            ? "Checking Translation..."
            : "Generate Translation"}
        </Button>
      )}
    </Box>
  );
};

export default LanguageControls;
