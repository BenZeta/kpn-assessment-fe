import Introduction from "@/components/subtest/Introduction";
import Subtest from "@/components/subtest/Subtest";
import useAPI from "@/hooks/useAPI";
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
    },
    context: { activeTab, completedSteps },
  });

  console.log("Default Values", methods.getValues());

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
          });
        } catch (error) {
          if (isAxiosError(error)) {
            snack.error(error.response?.data.message || "An error occurred");
          } else {
            snack.error("Failed to fetch subtest data");
          }
        } finally {
          hideLoading();
        }
      }
    };
    fetchAndSetData();
  }, [id]);

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
        <TabPanel value={activeTab} index={0}>
          <Introduction control={methods.control} />
        </TabPanel>
        <TabPanel value={activeTab} index={1}>
          <Subtest control={methods.control} />
        </TabPanel>
      </Create>
    </FormProvider>
  );
};
export default SubtestTemp;
