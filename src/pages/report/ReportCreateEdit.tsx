import { Create } from "@refinedev/mui";
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

// import { StyledTabs, StyledTab } from "../master-data/batch/BatchCreateEdit";
import { Box, Tabs, Tab, styled, Stack, Button, IconButton } from "@mui/material";
import { ArrowBack, ArrowForward, Save } from "@mui/icons-material";
import { FormProvider, useForm } from "react-hook-form";
import Introduction from "@/components/report/Introduction";
import Details from "@/components/report/Details";
import Preview from "@/components/report/Preview";

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

const ReportCreateEdit: React.FC = () => {
  const { state } = useLocation();
  const batchId = state?.batchId;
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = React.useState(0);
  const [completedSteps, setCompletedSteps] = React.useState<Record<number, boolean>>({});

  const methods = useForm<any>({
    defaultValues: {
      batch_id: batchId,
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
    {
      label: "Preview",
      Component: Preview,
      fields: [],
    }
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

  const handleSave = () => {
    if (isStepCompleted(activeTab)) {
      methods.handleSubmit(data => {
        const processedData = {
          ...data,
          intro: data.intro.map((item: any) => ({
            ...item,
            category_id: Number(item.category_id),
          })),
        };

        console.log("Form Data", JSON.stringify(processedData, null, 2));
      })();
    }
  };

  return (
    <FormProvider {...methods}>
      <Create
        title={
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <StyledTabs value={0} onChange={() => {}} centered={true}>
              {tabs.map((tab, index) => (
                <StyledTab
                  key={index}
                  label={tab.label}
                  id={`report-tab-${index}`}
                  aria-controls={`report-tabpanel-${index}`}
                  onClick={() => {}}
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
              <Button variant="contained" onClick={handleSave} startIcon={<Save />}>
                Save
              </Button>
            )}
          </Stack>
        }
        goBack={<IconButton children={<ArrowBack />} onClick={() => navigate(-1)} />}
      >
        <TabPanel value={activeTab} index={0}>
          <Introduction control={methods.control} batchId={batchId} />
        </TabPanel>
        <TabPanel value={activeTab} index={1}>
          <Details control={methods.control} batchId={batchId} />
        </TabPanel>
        <TabPanel value={activeTab} index={2}>
          <Preview control={methods.control} batchId={batchId} />
        </TabPanel>
      </Create>
    </FormProvider>
  );
};
export default ReportCreateEdit;
