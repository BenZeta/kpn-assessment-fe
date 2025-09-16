import LanguageControls from "@/components/forms/LanguageControls";
import Introduction from "@/components/subtest/Introduction";
import Subtest from "@/components/subtest/Subtest";
import useAPI from "@/hooks/useAPI";
import useFetch from "@/hooks/useFetch";
import { useLoading } from "@/providers/LoadingProvider";
import { snack } from "@/providers/SnackbarProvider";
import { ArrowBack, ArrowForward, Save } from "@mui/icons-material";
import { Box, Button, IconButton, Stack, styled, Tab, Tabs } from "@mui/material";
import { Create } from "@refinedev/mui";
import { isAxiosError } from "axios";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";

const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  display: "flex",
  // width: "100%",
  justifyContent: "center",
  "& .MuiTabs-indicator": {
    backgroundColor: theme.palette.primary.main,
    height: 3,
  },
}));

const StyledTab = styled(Tab)<{ completed?: boolean }>(({ theme, completed }) => ({
  textTransform: "none",
  fontSize: theme.typography.pxToRem(15),
  marginRight: theme.spacing(4),
  color: completed ? theme.palette.success.main : theme.palette.text.primary,
  "&.Mui-selected": {
    color: theme.palette.primary.main,
    fontWeight: "bold",
  },
}));

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`batch-tabpanel-${index}`}
      aria-labelledby={`batch-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

const SubtestTemp: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const API = useAPI();
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const { showLoading, hideLoading } = useLoading();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  // Translation states
  const [isSwitchingLanguageType, setIsSwitchingLanguageType] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [_isLanguageTypeSwitching, setIsLanguageTypeSwitching] = useState(false);
  const [translationState, setTranslationState] = useState<{
    exists: boolean | null;
    isChecking: boolean;
    isGenerating: boolean;
  }>({
    exists: null,
    isChecking: false,
    isGenerating: false,
  });

  // Fetch languages data
  const { data: languages } = useFetch<any>("/languages");
  const { data: languagesWithStatus } = useFetch<any>(
    isEdit && id ? `/subtest/${id}/languages` : null
  );

  const methods = useForm<any>({
    mode: "onChange",
    defaultValues: {
      subtest_name: "",
      subtest_code: "",
      subtest_duration: null,
      is_active: true,
      intro_desc: "",
      series: [],
      series_example_id: null,
      subtest_desc: "",
      is_duration: true,
      is_criteria: true,
      criteria_id: "",
      is_example_answer_shown: true,
      is_mandatory: true,
      language_id: "",
      language_type: "main",
    },
    context: { activeTab, completedSteps },
  });

  console.log("Default Values", methods.getValues());

  // Watch language fields
  const languageType = methods.watch("language_type");
  const selectedLanguageId = methods.watch("language_id");
  const [isAutoUpdatingForm, setIsAutoUpdatingForm] = useState(false);
  const [lastCheckedLanguage, setLastCheckedLanguage] = useState<string | null>(null);

  // const {
  //   formstate: { error },
  // } = methods;

  const tabs: Array<{
    label: string;
    Component: React.FC<any>;
    fields: string[];
  }> = [
    {
      label: "Introduction",
      Component: Introduction,
      fields: [],
    },
    {
      label: "Subtest",
      Component: Subtest,
      fields: [],
    },
  ];

  const isStepCompleted = (stepIndex: number) => {
    const stepFields = tabs[stepIndex].fields;
    const allFieldsCompleted = stepFields.every(field => {
      const fieldValue = methods.getValues(field);
      return fieldValue !== undefined && fieldValue !== null && fieldValue !== "";
    });
    return allFieldsCompleted;
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    if (completedSteps[newValue - 1] || newValue <= activeTab) {
      setActiveTab(newValue);
    }
  };

  const handleNext = () => {
    if (isStepCompleted(activeTab)) {
      setCompletedSteps({ ...completedSteps, [activeTab]: true });
      if (activeTab < tabs.length - 1) {
        setActiveTab(activeTab + 1);
      }
    }
  };

  const isNextDisabled = !isStepCompleted(activeTab);

  const handleBack = () => {
    if (activeTab > 0) {
      setActiveTab(activeTab - 1);
    }
  };

  // TODO: Fetch existing subtest data if id is provided

  useEffect(() => {
    const fetchAndSetData = async () => {
      if (id) {
        showLoading();
        try {
          const { data: subtest } = await API.get(`/subtest/${id}`);
          console.log("here subtest", JSON.stringify(subtest, null, 2));
          methods.reset({
            ...subtest.data,
            subtest_duration: dayjs(subtest.data.subtest_duration, "HH:mm:ss"),
            series: subtest.data.series.map((item: any) => ({
              series_id: item.series_id,
            })),
            criteria_id: subtest.data.criteria?.value_id || null,
            language_id: subtest.data.language_id || "",
            language_type: "main", // Default to main for existing subtests
          });

          // Mark initial load as complete after form is reset
          setTimeout(() => setIsInitialLoad(false), 100);
        } catch (error) {
          if (isAxiosError(error)) {
            snack.error(error.response?.data.message || "An error occurred");
          } else {
            snack.error("Failed to fetch subtest data");
          }
        } finally {
          hideLoading();
        }
      } else {
        // For create mode, mark initial load complete immediately
        setTimeout(() => setIsInitialLoad(false), 100);
      }
    };
    fetchAndSetData();
  }, [id]);

  // Effect to reset translation state when language type changes
  useEffect(() => {
    if (!isInitialLoad) {
      setIsLanguageTypeSwitching(true);
      setTranslationState({
        exists: null,
        isChecking: false,
        isGenerating: false,
      });
      // Reset last checked language when switching type
      setLastCheckedLanguage(null);
    }
  }, [languageType, isInitialLoad]);

  // Handle language type switching
  useEffect(() => {
    if (isEdit && id && languageType && languagesWithStatus?.data && !isInitialLoad) {
      setTranslationState(prev => ({
        ...prev,
        exists: null,
        // Do not auto-check on type switch to avoid flicker; only check after a specific language is selected
        isChecking: false,
      }));

      const handleLanguageTypeSwitch = async () => {
        try {
          setIsAutoUpdatingForm(true);
          const response = await API.get(
            `/subtest/${id}/language-selection?languageType=${languageType}`
          );
          const data = response.data.data;

          setIsSwitchingLanguageType(true);
          methods.setValue("language_id", data.language_code);

          if (languageType === "sub") {
            setTranslationState(prev => ({
              ...prev,
              exists: data.has_translation,
              isChecking: false,
            }));

            if (data.has_translation && data.translation_data) {
              methods.setValue("intro_desc", data.translation_data.intro_desc || "");
              methods.setValue("subtest_desc", data.translation_data.subtest_desc || "");
            } else {
              // No translation exists - pre-fill with main language data
              const currentData = methods.getValues();
              methods.setValue("intro_desc", currentData.intro_desc || "");
              methods.setValue("subtest_desc", currentData.subtest_desc || "");
            }
          } else {
            // For main language, reset translation state and reload main data
            setTranslationState(prev => ({
              ...prev,
              exists: null,
              isChecking: false,
            }));

            // Re-load main subtest data when switching back to main
            if (id) {
              const { data: subtest } = await API.get(`/subtest/${id}`);
              methods.setValue("intro_desc", subtest.data.intro_desc || "");
              methods.setValue("subtest_desc", subtest.data.subtest_desc || "");
            }
          }
        } catch (error) {
          console.error("Error fetching language and translation:", error);
          setTranslationState(prev => ({
            ...prev,
            exists: null,
            isChecking: false,
          }));
        } finally {
          setIsAutoUpdatingForm(false);
          setIsSwitchingLanguageType(false);
          setTimeout(() => setIsLanguageTypeSwitching(false), 100);
        }
      };

      handleLanguageTypeSwitch();
    }
  }, [isEdit, id, languageType, languagesWithStatus?.data]);

  // Handle specific language selection for sub-language mode
  useEffect(() => {
    if (
      isEdit &&
      id &&
      languageType === "sub" &&
      selectedLanguageId &&
      selectedLanguageId !== "" &&
      !isSwitchingLanguageType &&
      !isInitialLoad &&
      !isAutoUpdatingForm &&
      selectedLanguageId !== lastCheckedLanguage &&
      !translationState.isGenerating
    ) {
      setTranslationState(prev => ({
        ...prev,
        isChecking: true,
      }));

      const fetchTranslationForSelectedLanguage = async () => {
        try {
          setIsAutoUpdatingForm(true);
          setLastCheckedLanguage(selectedLanguageId);
          const response = await API.get(`/subtest/${id}/language/${selectedLanguageId}`);
          const translationData = response.data.data;

          setTranslationState(prev => ({
            ...prev,
            exists: true,
            isChecking: false,
          }));

          methods.setValue("intro_desc", translationData.intro_desc || "");
          methods.setValue("subtest_desc", translationData.subtest_desc || "");
        } catch (error) {
          if (isAxiosError(error) && error.response?.status === 404) {
            // Translation doesn't exist - populate with main language data as default
            setTranslationState(prev => ({
              ...prev,
              exists: false,
              isChecking: false,
            }));

            // Pre-fill with main language data
            if (id) {
              const { data: subtest } = await API.get(`/subtest/${id}`);
              methods.setValue("intro_desc", subtest.data.intro_desc || "");
              methods.setValue("subtest_desc", subtest.data.subtest_desc || "");
            }
          } else {
            console.error("Error fetching translation data:", error);
            setTranslationState(prev => ({
              ...prev,
              exists: null,
              isChecking: false,
            }));
          }
        } finally {
          setIsAutoUpdatingForm(false);
        }
      };

      fetchTranslationForSelectedLanguage();
    }
  }, [
    selectedLanguageId,
    isSwitchingLanguageType,
    isAutoUpdatingForm,
    lastCheckedLanguage,
    translationState.isGenerating,
  ]);

  // Generate translation function (tab-specific)
  const generateTranslation = async (fieldsToTranslate: string[]) => {
    if (!id || !selectedLanguageId || !fieldsToTranslate.length) return;

    setTranslationState(prev => ({
      ...prev,
      isGenerating: true,
      // Ensure checking state is cleared while generating to avoid label flicker
      isChecking: false,
    }));

    try {
      const response = await API.post(`/subtest/${id}/language/${selectedLanguageId}/generate`, {
        fields: fieldsToTranslate,
      });
      const translationData = response.data.data;

      // Populate form with generated translation data (only for requested fields)
      fieldsToTranslate.forEach(field => {
        if (translationData[field]) {
          methods.setValue(field, translationData[field]);
        }
      });

      setTranslationState(prev => ({
        ...prev,
        exists: true,
        isGenerating: false,
      }));

      const fieldNames = fieldsToTranslate
        .map(field => {
          switch (field) {
            case "intro_desc":
              return "Introduction Description";
            case "subtest_desc":
              return "Subtest Description";
            default:
              return field;
          }
        })
        .join(" and ");

      snack.success(`Translation generated for ${fieldNames}!`);
    } catch (error) {
      console.error("Error generating translation:", error);
      setTranslationState(prev => ({
        ...prev,
        isGenerating: false,
      }));

      if (isAxiosError(error)) {
        const data = error.response?.data;
        snack.error(data?.message || "Failed to generate translation");
      } else {
        snack.error("Failed to generate translation");
      }
    }
  };

  // TODO: Implement the onSubmit function to handle form submission
  const onSubmit = async (data: any) => {
    showLoading();
    try {
      const payload = {
        ...data,
        series_example_id: data.series_example_id || null,
        intro_desc: data.intro_desc || null,
        series: data.series.map((item: any) => ({
          series_id: item.series_id,
        })),
        subtest_duration:
          data.is_duration && data.subtest_duration && dayjs(data.subtest_duration).isValid()
            ? dayjs(data.subtest_duration).format("HH:mm:ss")
            : null,
        subtest_desc: data.subtest_desc || null,
        language_type: data.language_type,
        language_id: data.language_id,
      };
      console.log("Payload", payload);
      if (id) {
        await API.patch(`/subtest/${id}`, payload);
        snack.success("Subtest updated successfully!");
        navigate(-1);
        return;
      }
      await API.post("/subtest", payload);
      snack.success("Subtest created successfully!");
      navigate(-1);
    } catch (error) {
      if (isAxiosError(error)) {
        snack.error(error.response?.data.message || "An error occurred");
      } else {
        snack.error("Failed to create or update subtest");
      }
    } finally {
      hideLoading();
    }
  };

  const getLanguageOptions = () => {
    let availableLanguages = [];

    if (isEdit && languagesWithStatus?.data) {
      availableLanguages = languagesWithStatus.data;
    } else {
      availableLanguages = languages?.data || [];
    }

    if (isEdit && languagesWithStatus?.data && languageType) {
      if (languageType === "sub") {
        const mainLanguage = languagesWithStatus.data.find(
          (lang: any) => lang.translation_status === "main"
        );

        if (mainLanguage) {
          availableLanguages = availableLanguages.filter(
            (lang: any) => lang.language_code !== mainLanguage.language_code
          );
        }
      } else if (languageType === "main") {
        availableLanguages = availableLanguages.filter(
          (lang: any) =>
            lang.translation_status === "main" ||
            lang.translation_status === "translation_available"
        );
      }
    }

    return availableLanguages;
  };

  return (
    <FormProvider {...methods}>
      <Create
        title={
          <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
            <StyledTabs
              value={activeTab}
              onChange={handleTabChange}
              aria-label="subtest tabs"
              centered
            >
              {tabs.map((tab, index) => (
                <StyledTab
                  key={index}
                  label={tab.label}
                  id={`subtest-tab-${index}`}
                  aria-controls={`subtest-tabpanel-${index}`}
                  completed={completedSteps[index]}
                />
              ))}
            </StyledTabs>
          </Box>
        }
        footerButtons={
          <Stack direction="row" justifyContent="space-between" width="100%">
            <Button
              variant="outlined"
              onClick={handleBack}
              disabled={activeTab === 0}
              startIcon={<ArrowBack />}
            >
              Back
            </Button>
            {activeTab < tabs.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={isNextDisabled}
                endIcon={<ArrowForward />}
              >
                Next
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={methods.handleSubmit(onSubmit)}
                startIcon={<Save />}
              >
                Save
              </Button>
            )}
          </Stack>
        }
        goBack={<IconButton children={<ArrowBack />} onClick={() => navigate(-1)} />}
      >
        {/* Show content only when not in sub-language mode OR when sub-language is selected */}
        {(!isEdit ||
          languageType !== "sub" ||
          (selectedLanguageId && selectedLanguageId !== "")) && (
          <>
            <TabPanel value={activeTab} index={0}>
              <LanguageControls
                isEdit={isEdit}
                isInitialLoad={isInitialLoad}
                languagesWithStatus={languagesWithStatus}
                languages={languages}
                methods={methods}
                getLanguageOptions={getLanguageOptions}
                generateTranslation={generateTranslation}
                translationState={translationState}
                selectedLanguageId={selectedLanguageId}
                languageType={languageType}
                fieldsToTranslate={activeTab === 0 ? ["intro_desc"] : ["subtest_desc"]}
              />
              <Introduction control={methods.control} />
            </TabPanel>
            <TabPanel value={activeTab} index={1}>
              <LanguageControls
                isEdit={isEdit}
                isInitialLoad={isInitialLoad}
                languagesWithStatus={languagesWithStatus}
                languages={languages}
                methods={methods}
                getLanguageOptions={getLanguageOptions}
                generateTranslation={generateTranslation}
                translationState={translationState}
                selectedLanguageId={selectedLanguageId}
                languageType={languageType}
                fieldsToTranslate={activeTab === 0 ? ["intro_desc"] : ["subtest_desc"]}
              />
              <Subtest control={methods.control} />
            </TabPanel>
          </>
        )}
      </Create>
    </FormProvider>
  );
};
export default SubtestTemp;
