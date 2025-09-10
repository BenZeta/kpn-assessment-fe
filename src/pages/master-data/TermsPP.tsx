import LanguageControls from "@/components/forms/LanguageControls";
import RTEField from "@/components/forms/RTEField";
import { BoxSkeleton } from "@/components/Skeleton";
import useAPI from "@/hooks/useAPI";
import useAuthStore from "@/hooks/useAuthStore";
import useFetch from "@/hooks/useFetch";
import { useLoading } from "@/providers/LoadingProvider";
import { snack } from "@/providers/SnackbarProvider";
import { TermsPPValues } from "@/types/MasterData";
import { Box, Button, Tab, Tabs, Typography } from "@mui/material";
import { isAxiosError } from "axios";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

const TermsPP = () => {
  const API = useAPI();
  const user_id = useAuthStore(state => state.user_id);
  const getPermission = useAuthStore(state => state.getPermission);
  const { showLoading, hideLoading } = useLoading();

  // Tab state
  const [activeTab, setActiveTab] = useState(0);
  const currentType = activeTab === 0 ? "terms" : "pp";

  // Translation state for each tab
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [translationStates, setTranslationStates] = useState<{
    terms: {
      exists: boolean | null;
      isChecking: boolean;
      isGenerating: boolean;
    };
    pp: {
      exists: boolean | null;
      isChecking: boolean;
      isGenerating: boolean;
    };
  }>({
    terms: {
      exists: null,
      isChecking: false,
      isGenerating: false,
    },
    pp: {
      exists: null,
      isChecking: false,
      isGenerating: false,
    },
  });

  // Fetch data
  const { data: termsPP, refetch } = useFetch<any>("/terms-pp");
  const { data: languages } = useFetch<any>("/languages");
  const termsLanguagesWithStatus = useFetch<any>("/terms-pp/terms/languages");
  const ppLanguagesWithStatus = useFetch<any>("/terms-pp/pp/languages");
  
  // Get current tab's language status and translation state
  const languagesWithStatus = currentType === 'terms' ? termsLanguagesWithStatus : ppLanguagesWithStatus;
  const translationState = translationStates[currentType as 'terms' | 'pp'];

  const methods = useForm({
    defaultValues: {
      terms: "",
      pp: "",
      language_type: "main",
      language_id: "id",
      updated_by: user_id,
    } as TermsPPValues & {
      language_type: string;
      language_id: string;
    },
  });

  // Watch language fields
  const languageType = methods.watch("language_type");
  const selectedLanguageId = methods.watch("language_id");
  const [lastCheckedLanguage, setLastCheckedLanguage] = useState<string | null>(null);

  useEffect(() => {
    if (termsPP) {
      const terms = termsPP.data.terms;
      const pp = termsPP.data.pp;
      methods.reset({
        terms: terms.name,
        pp: pp.name,
        language_type: "main",
        language_id: "id",
        updated_by: user_id,
      });
      setIsInitialLoad(false);
    }
  }, [termsPP, user_id]);

  // Handle language type switching
  useEffect(() => {
    if (isInitialLoad) return;

    const switchLanguageType = async () => {
      try {
        setTranslationStates(prev => ({ 
          ...prev, 
          [currentType]: { ...prev[currentType as 'terms' | 'pp'], isChecking: true }
        }));

        const response = await API.get(`/terms-pp/${currentType}/language-selection`, {
          params: { languageType },
        });

        const recommendedLanguage = response.data.data;
        methods.setValue("language_id", recommendedLanguage.language_code);

        // Load translation data if exists
        if (recommendedLanguage.has_translation && recommendedLanguage.translation_data) {
          const fieldName = currentType === "terms" ? "terms" : "pp";
          methods.setValue(fieldName, recommendedLanguage.translation_data.name);
        }

        setTranslationStates(prev => ({
          ...prev,
          [currentType]: {
            ...prev[currentType as 'terms' | 'pp'],
            exists: recommendedLanguage.has_translation,
            isChecking: false,
          }
        }));
      } catch (error) {
        console.error("Error switching language type:", error);
        setTranslationStates(prev => ({ 
          ...prev, 
          [currentType]: { ...prev[currentType as 'terms' | 'pp'], isChecking: false }
        }));
      }
    };

    switchLanguageType();
    setLastCheckedLanguage(null);
  }, [languageType, currentType, isInitialLoad]);

  // Handle language selection changes
  useEffect(() => {
    if (isInitialLoad || !selectedLanguageId || selectedLanguageId === lastCheckedLanguage) return;

    const checkTranslation = async () => {
      if (languageType === "main") {
        // For main language, load from main data
        if (termsPP) {
          const data = currentType === "terms" ? termsPP.data.terms : termsPP.data.pp;
          methods.setValue(currentType, data.name);
        }
        setTranslationStates(prev => ({ 
          ...prev, 
          [currentType]: { ...prev[currentType as 'terms' | 'pp'], exists: true }
        }));
        setLastCheckedLanguage(selectedLanguageId);
        return;
      }

      try {
        setTranslationStates(prev => ({ 
          ...prev, 
          [currentType]: { ...prev[currentType as 'terms' | 'pp'], isChecking: true }
        }));

        const response = await API.get(`/terms-pp/${currentType}/language/${selectedLanguageId}`);

        // Translation exists, load it
        methods.setValue(currentType, response.data.data.name);
        setTranslationStates(prev => ({
          ...prev,
          [currentType]: {
            ...prev[currentType as 'terms' | 'pp'],
            exists: true,
            isChecking: false,
          }
        }));
      } catch (error) {
        // Translation doesn't exist
        if (termsPP) {
          const mainData = currentType === "terms" ? termsPP.data.terms : termsPP.data.pp;
          methods.setValue(currentType, mainData.name);
        }
        setTranslationStates(prev => ({
          ...prev,
          [currentType]: {
            ...prev[currentType as 'terms' | 'pp'],
            exists: false,
            isChecking: false,
          }
        }));
      }

      setLastCheckedLanguage(selectedLanguageId);
    };

    checkTranslation();
  }, [selectedLanguageId, languageType, currentType, termsPP, lastCheckedLanguage, isInitialLoad]);

  // Refetch languages when tab changes
  useEffect(() => {
    // Refetch both language statuses when tab changes
    termsLanguagesWithStatus.refetch();
    ppLanguagesWithStatus.refetch();
  }, [currentType]);

  const getLanguageOptions = () => {
    if (languageType === "main") {
      return (
        languagesWithStatus.data?.data?.filter((lang: any) => lang.translation_status === "main") ||
        []
      );
    } else {
      return (
        languagesWithStatus.data?.data?.filter((lang: any) => lang.translation_status !== "main") ||
        []
      );
    }
  };

  const generateTranslation = async (fieldsToTranslate: string[]) => {
    try {
      setTranslationStates(prev => ({ 
        ...prev, 
        [currentType]: { ...prev[currentType as 'terms' | 'pp'], isGenerating: true }
      }));

      // Get main language data for translation
      if (termsPP) {
        const mainData = currentType === 'terms' ? termsPP.data.terms : termsPP.data.pp;
        
        // Use the generic translation endpoint for preview
        const response = await API.post('/translation/translate', {
          fieldsToTranslate: { name: mainData.name },
          sourceLanguage: 'id', // Assuming main language is Indonesian
          targetLanguage: selectedLanguageId,
        });

        // Preview the generated translation (don't save yet)
        methods.setValue(currentType, response.data.data.name);
        setTranslationStates(prev => ({
          ...prev,
          [currentType]: {
            ...prev[currentType as 'terms' | 'pp'],
            exists: false, // Still not saved to database
            isGenerating: false,
          }
        }));

        snack.success(
          `${currentType === "terms" ? "Terms" : "Privacy Policy"} translation generated (preview). Click Update to save.`
        );
      }
    } catch (error) {
      console.error("Translation generation failed:", error);
      if (isAxiosError(error)) {
        snack.error("Translation failed: " + error.response?.data?.message);
      } else {
        snack.error("Translation generation failed");
      }
      setTranslationStates(prev => ({ 
        ...prev, 
        [currentType]: { ...prev[currentType as 'terms' | 'pp'], isGenerating: false }
      }));
    }
  };

  const onUpdate = async (values: any) => {
    showLoading();
    try {
      // Always use the existing terms/pp endpoints - they handle both main and translation updates
      const endpoint = `/terms-pp/${currentType}`;
      const payload = {
        name: values[currentType],
        updated_by: user_id,
        // Add language context for translations
        ...(languageType === "sub" && {
          language_id: selectedLanguageId,
          language_type: "sub",
        }),
      };

      await API.patch(endpoint, payload);
      refetch();
      // Refetch the correct language status based on current tab
      if (currentType === 'terms') {
        termsLanguagesWithStatus.refetch();
      } else {
        ppLanguagesWithStatus.refetch();
      }
      snack.success(`${currentType === "terms" ? "Terms" : "Privacy Policy"} updated successfully`);
    } catch (error) {
      if (isAxiosError(error)) {
        const data = error.response?.data;
        snack.error("Something went wrong: " + data.message);
        console.error(error.response);
      } else {
        snack.error("Error, check log for details");
        console.error(error);
      }
    } finally {
      hideLoading();
    }
  };

  return (
    <>
      <Typography variant="h1" color="primary">
        Terms & Privacy Policy
      </Typography>

      {getPermission("fread", 2) && (
        <>
          {/* Language Controls */}
          <LanguageControls
            isEdit={true}
            isInitialLoad={isInitialLoad}
            languagesWithStatus={languagesWithStatus}
            languages={languages}
            methods={methods}
            getLanguageOptions={getLanguageOptions}
            generateTranslation={generateTranslation}
            translationState={translationState}
            selectedLanguageId={selectedLanguageId}
            languageType={languageType}
            fieldsToTranslate={["name"]}
            containerSx={{ px: 0 }}
          />

          {/* Tabs for Terms/PP */}
          <Box sx={{ mb: 3 }}>
            <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
              <Tab label="Terms & Conditions" />
              <Tab label="Privacy Policy" />
            </Tabs>
          </Box>

          {/* Content */}
          <Box sx={{ mt: 2 }}>
            {termsPP ? (
              <>
                <RTEField
                  name={currentType}
                  label={currentType === "terms" ? "Terms & Conditions" : "Privacy Policy"}
                  control={methods.control}
                  readOnly={!getPermission("fupdate", 2)}
                  sx={{ mb: 1 }}
                />
                <Box
                  sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                >
                  <Typography color="text.secondary">
                    Last update: {termsPP && termsPP.data[currentType].updated_date}
                  </Typography>
                  {getPermission("fupdate", 2) && (
                    <Button
                      variant="contained"
                      disabled={methods.formState.isSubmitting}
                      onClick={methods.handleSubmit(onUpdate)}
                    >
                      Update
                    </Button>
                  )}
                </Box>
              </>
            ) : (
              <BoxSkeleton />
            )}
          </Box>
        </>
      )}
    </>
  );
};
export default TermsPP;
