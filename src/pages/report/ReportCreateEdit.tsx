import { Create } from "@refinedev/mui";
import React, { useEffect, createContext, useContext } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Box, Tabs, Tab, styled, Stack, Button, IconButton } from "@mui/material";
import { ArrowBack, ArrowForward, Save } from "@mui/icons-material";
import { FormProvider, useForm } from "react-hook-form";
import Introduction from "@/components/report/Introduction";
import Details from "@/components/report/Details";
import useAPI from "@/hooks/useAPI";
import { snack } from "@/providers/SnackbarProvider";
import { isAxiosError } from "axios";
import useFetch from "@/hooks/useFetch";

const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  display: "flex",
  "& .MuiTabs-indicator": {
    backgroundColor: theme.palette.primary.main,
    height: 3,
  },
  margin: "0 auto",
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
      id={`report-tabpanel-${index}`}
      aria-labelledby={`report-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

const ReportEdit = createContext<any>({});

const ReportCreateEdit: React.FC = () => {
  const { state } = useLocation();
  const { id } = useParams();
  const api = useAPI();
  const batchId = state?.batchId;
  console.log("ReportCreateEdit", batchId);
  const navigate = useNavigate();
  const { data: data_report, loading: loading_report } = useFetch<any>(
    `/report/template/${batchId}`
  );
  // console.log(JSON.stringify(data_report, null, 2));
  const [activeTab, setActiveTab] = React.useState(0);
  const [completedSteps, setCompletedSteps] = React.useState<Record<number, boolean>>({});

  const methods = useForm<any>({
    defaultValues: {
      batch_id: batchId,
      content: "",
      cover_id: "",
      new_guide: false,
      guide_hist_clicked: false,
      intro: [],
      details: [],
    },
  });

  const tabs: Array<{ label: string; Component: React.FC<any>; fields: string[] }> = [
    {
      label: "Introduction",
      Component: Introduction,
      fields: [],
    },
    {
      label: "Details",
      Component: Details,
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

  useEffect(() => {
    if (!data_report || !id) return; // hanya reset jika ada data dan sedang edit

    let detail_field: any[] = [];
    let intro_field = data_report.data.categories.map((item: any) => {
      for (const test of item.tests) {
        detail_field.push({
          test_id: test.id,
          summary_formula: test.summary_formula,
          summary_type: test.summary_type,
          summary_view: test.summary_view,
        });
      }

      return {
        category_id: item.id,
        summary_formula: item.summary_formula,
        summary_type: item.summary_type,
        summary_view: item.summary_view,
      };
    });

    methods.reset({
      cover_id: data_report.data.cover_id,
      content: data_report.data.guide.content,
      intro: intro_field,
      details: detail_field,
      batch_id: batchId,
      new_guide: false,
      guide_hist_clicked: false,
    });
  }, [data_report, id]);

  const handleSave = () => {
    if (isStepCompleted(activeTab)) {
      methods.handleSubmit(async data => {
        const processedData = {
          cover_id: data.cover_id,
          content: data.content,
          batch_id: data.batch_id,
          details: data.details,
          intro: data.intro.map((item: any) => ({
            ...item,
            category_id: parseInt(item.category_id),
          })),
        };
        console.log("payload", JSON.stringify(processedData, null, 2));
        try {
          if (id) {
            const { data: update_report } = await api.patch(`/report/design/${id}`, processedData);
            snack.success(update_report.message);
            navigate(-1);
            return;
          }
          const { data: insert_to_design } = await api.post("/report/design", processedData);
          if (data.new_guide) {
            api.post("/report/guide", {
              content: data.content,
            });
          }
          snack.success(insert_to_design.message);
          setTimeout(() => {
            navigate("/admin/inrepdes");
          }, 500);
        } catch (error) {
          console.error(error);
          if (isAxiosError(error)) {
            snack.error(error?.response?.data.message);
          } else {
            snack.error((error as Error).message);
          }
        }
      })();
    }
  };

  console.log("Default Values:", methods.getValues());

  useEffect(() => {
    if (methods.getValues("guide_hist_clicked")) {
      methods.setValue("guide_hist_clicked", false);
      methods.setValue("new_guide", false);
    } else {
      methods.setValue("new_guide", true);
    }
  }, [methods.watch("content")]);

  return (
    <ReportEdit.Provider value={{ data: data_report, loading: loading_report }}>
      <FormProvider {...methods}>
        <Create
          title={
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <StyledTabs value={activeTab} onChange={() => {}} centered={true}>
                {tabs.map((tab, index) => (
                  <StyledTab
                    key={index}
                    label={tab.label}
                    id={`report-tab-${index}`}
                    aria-controls={`report-tabpanel-${index}`}
                    onClick={handleTabChange}
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
                <Button variant="contained" onClick={handleNext} endIcon={<ArrowForward />}>
                  Next
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleSave}
                  startIcon={<Save />}
                  loading={methods.formState.isSubmitting}
                >
                  Save
                </Button>
              )}
            </Stack>
          }
          goBack={<IconButton children={<ArrowBack />} onClick={() => navigate(-1)} />}
        >
          <TabPanel value={activeTab} index={0}>
            <Introduction control={methods.control} />
          </TabPanel>
          <TabPanel value={activeTab} index={1}>
            <Details control={methods.control} batchId={batchId} />
          </TabPanel>
        </Create>
      </FormProvider>
    </ReportEdit.Provider>
  );
};

export const useReportContext = () => {
  return useContext(ReportEdit);
};
export default ReportCreateEdit;
