import CoverPage from "@/components/report/CoverPage";
import Details from "@/components/report/Details";
import Introduction from "@/components/report/Introduction";
import PsychographPage from "@/components/report/PsychographPage";
import useAPI from "@/hooks/useAPI";
import useFetch from "@/hooks/useFetch";
import { snack } from "@/providers/SnackbarProvider";
import { ArrowBack, ArrowForward, Save } from "@mui/icons-material";
import {
  Box,
  Button,
  IconButton,
  Stack,
  Step,
  StepLabel,
  Stepper
} from "@mui/material";
import { Create } from "@refinedev/mui";
import { isAxiosError } from "axios";
import React, { createContext, useContext, useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useLocation, useNavigate, useParams } from "react-router-dom";


const TabPanel: React.FC<{
  children?: React.ReactNode;
  index: number;
  activeStep: number;
}> = ({ children, index, activeStep }) =>
  activeStep === index ? <Box sx={{ pt: 3 }}>{children}</Box> : null;

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
  const [activeStep, setActiveStep] = React.useState(0);
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


  const steps = ["Cover", "Introduction", "Psychograph", "Detail Tests"];

  const isStepCompleted = (stepIndex: number) => {
    return completedSteps[stepIndex] === true;
  };



  const handleNext = () => {
    if (!isStepCompleted(activeStep)) {
      // tandai step ini selesai
      setCompletedSteps({ ...completedSteps, [activeStep]: true });
    }
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
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
    if (isStepCompleted(activeStep - 1)) {
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
            <Box sx={{ width: "100%", mb: 2 }}>
              <Stepper activeStep={activeStep} alternativeLabel>
                {steps.map((label, index) => (
                  <Step key={label} completed={isStepCompleted(index)}>
                    <StepLabel
                      onClick={() => {
                        if (index <= activeStep || isStepCompleted(index - 1)) {
                          setActiveStep(index);
                        }
                      }}
                      sx={{ cursor: "pointer" }}
                    >
                      {label}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>
          }
          footerButtons={
            <Stack direction="row" justifyContent="space-between" width="100%">
              <Button
                variant="outlined"
                onClick={handleBack}
                disabled={activeStep === 0}
                startIcon={<ArrowBack />}
              >
                Back
              </Button>
              {activeStep < steps.length - 1 ? (
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
          <TabPanel activeStep={activeStep} index={0}>
            <CoverPage control={methods.control} />
          </TabPanel>
          <TabPanel activeStep={activeStep} index={1}>
            <Introduction control={methods.control} />
          </TabPanel>
          <TabPanel activeStep={activeStep} index={2}>
            <PsychographPage control={methods.control} />
          </TabPanel>
          <TabPanel activeStep={activeStep} index={3}>
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
