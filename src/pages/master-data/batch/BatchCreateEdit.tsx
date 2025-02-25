import AddGroupTest from "@/components/batch/AddGroupTest";
import Assignment from "@/components/batch/Assignment";
import BatchOverview from "@/components/batch/BatchOverview";
import { ArrowBack, ArrowForward, Check } from "@mui/icons-material";
import { Box, Button, Stack, Tab, Tabs, styled } from "@mui/material";
import { Create } from "@refinedev/mui";
import React, { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  "& .MuiTabs-indicator": {
    backgroundColor: theme.palette.primary.main,
    height: 3,
  },
}));

const StyledTab = styled(Tab)<{ completed?: boolean }>(
  ({ theme, completed }) => ({
    textTransform: "none",
    fontSize: theme.typography.pxToRem(15),
    marginRight: theme.spacing(1),
    color: completed ? theme.palette.success.main : theme.palette.text.primary,
    "&.Mui-selected": {
      color: theme.palette.primary.main,
      fontWeight: "bold",
    },
  })
);

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Tab Panel component
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

const BatchCreateEdit: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>(
    {}
  );

  const methods = useForm({
    defaultValues: {
      batch_name: "",
      batch_code: "",
      description: "",
      grouptest_id: [],
      bu_id: "",
      function_id: "",
      assessee_nik: [],
      assessee_name: [],
      assessee_email: [],
    },
    // resolver:
    context: { activeTab, completedSteps },
  });

  const {
    formState: { errors, isValid, dirtyFields },
  } = methods;

  const tabs = [
    {
      label: "Batch Overview",
      Component: BatchOverview,
      fields: ["batch_name", "batch_code", "description"],
    },
    {
      label: "Add Group Test",
      Component: AddGroupTest,
      fields: ["grouptest_id"],
    },
    {
      label: "Assignment",
      Component: Assignment,
      fields: ["bu_id", "function_id", "assessee_nik", "assessee_name", "assessee_email"],
    },
  ];

  const isStepCompleted = (stepIndex: number) => {
    const stepFields = tabs[stepIndex].fields;
    if (stepFields.length === 0) return true;
    if (stepFields.length === 0) return true;
    return stepFields.every((field) => {
      if (field === "grouptest_id") {
        return methods.watch(field)?.length > 0; 
      }
      return (
        !errors[field as keyof typeof errors] &&
        dirtyFields[field as keyof typeof dirtyFields]
      );
    });
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
      } else {
        methods.handleSubmit(onSubmit)();
      }
    }
  };

  const handleBack = () => {
    if (activeTab > 0) {
      setActiveTab(activeTab - 1);
    }
  };

  // TODO: Implement onSubmit
  const onSubmit = (data: any) => {
    console.log(data);
  };

  const isNextDisabled = !isStepCompleted(activeTab);

  return (
    <FormProvider {...methods}>
      <Create
        title={
          <Box sx={{ width: "100%" }}>
            <StyledTabs
              value={activeTab}
              onChange={handleTabChange}
              aria-label="batch creation tabs"
              variant="scrollable"
              scrollButtons="auto"
            >
              {tabs.map((tab, index) => (
                <StyledTab
                  key={index}
                  label={tab.label}
                  id={`batch-tab-${index}`}
                  aria-controls={`batch-tabpanel-${index}`}
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
              startIcon={<ArrowBack />}
              disabled={activeTab === 0}
            >
              Back
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              endIcon={
                activeTab === tabs.length - 1 ? <Check /> : <ArrowForward />
              }
              disabled={isNextDisabled}
              color={activeTab === tabs.length - 1 ? "success" : "primary"}
            >
              {activeTab === tabs.length - 1 ? "Submit" : "Next"}
            </Button>
          </Stack>
        }
        goBack
      >
        <TabPanel value={activeTab} index={0}>
          <BatchOverview control={methods.control} />
        </TabPanel>
        <TabPanel value={activeTab} index={1}>
          <AddGroupTest
            control={methods.control}
            batchData={methods.getValues()}
          />
        </TabPanel>
        <TabPanel value={activeTab} index={2}>
          <Assignment control={methods.control} />
        </TabPanel>
      </Create>
    </FormProvider>
  );
};
export default BatchCreateEdit;
