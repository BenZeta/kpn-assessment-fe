import SelectCtrl from "@/components/forms/Select";
import { Save } from "@mui/icons-material";
import { Box, Button, MenuItem, SxProps, Theme, Typography } from "@mui/material";
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
  fieldsToTranslate = ['intro_desc', 'subtest_desc'],
  hideGenerateButton = false,
}) => {
  const langsLoading = (isEdit && languagesWithStatus?.loading) || (!isEdit && languages?.loading);
  const languagesReady = !langsLoading;

  if (isInitialLoad) return null;

  return (
    <Box sx={{ mb: 3, px: 6, ...containerSx }}>
      <Box sx={{ display: "flex", gap: 2, alignItems: "end", mb: 2 }}>
        {isEdit && (
          <>
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
                }}
                renderValue={(selected: string) => {
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
                {getLanguageOptions().length === 0 ? (
                  <MenuItem disabled>No languages available</MenuItem>
                ) : (
                  getLanguageOptions().map((language: any) => (
                    <MenuItem
                      key={language.id}
                      value={language.language_code}
                      sx={!isEdit ? {} : (() => {
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
                      })()}
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
                  ))
                )}
              </SelectCtrl>
            )}

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
          </>
        )}

        {!isEdit && languagesReady && (
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
            }}
          >
            {languages?.data?.map((language: any) => (
              <MenuItem key={language.id} value={language.language_code}>
                {language.language_name} ({language.language_code})
              </MenuItem>
            ))}
          </SelectCtrl>
        )}
      </Box>

      {isEdit && languageType === "sub" && (!selectedLanguageId || selectedLanguageId === "") && (
        <Box
          sx={{
            mb: 2,
            p: 2,
            bgcolor: "warning.light",
            borderRadius: 1,
            maxWidth: "600px",
          }}
        >
          <Typography variant="body2" color="warning.contrastText">
            Please select a language to create or edit a translation.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default LanguageControls;
