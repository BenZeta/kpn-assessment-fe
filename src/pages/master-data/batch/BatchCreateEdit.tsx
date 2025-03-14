import AddGroupTest from "@/components/batch/AddGroupTest";
import Assignment from "@/components/batch/Assignment";
import AssignmentTime from "@/components/batch/AssignmentTime";
import BatchOverview from "@/components/batch/BatchOverview";
import ChooseEmail from "@/components/batch/ChooseEmail";
import Settings from "@/components/batch/Settings";
import useAPI from "@/hooks/useAPI";
import { useLoading } from "@/providers/LoadingProvider";
import { snack } from "@/providers/SnackbarProvider";
import { ArrowBack, ArrowForward } from "@mui/icons-material";
import { Box, Button, IconButton, Stack, Tab, Tabs, styled } from "@mui/material";
import { Create } from "@refinedev/mui";
import { isAxiosError } from "axios";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";

interface BatchFormData {
  batch_name: string;
  batch_code: string;
  description: string;
  grouptest_id: string;
  grouptest: any[];
  bu_id: string;
  bu_name: string;
  fm_id: string;
  fm_name: string;
  assessees: any[];
  start_date: Date | null;
  end_date: Date | null;
  start_time: Date | null;
  end_time: Date | null;
  email_template_id: string;
  email_detail: any[];
  is_mic: boolean;
  is_screenshot: boolean;
}

const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  "& .MuiTabs-indicator": {
    backgroundColor: theme.palette.primary.main,
    height: 3,
  },
}));

const StyledTab = styled(Tab)<{ completed?: boolean }>(({ theme, completed }) => ({
  textTransform: "none",
  fontSize: theme.typography.pxToRem(15),
  marginRight: theme.spacing(1),
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
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const { showLoading, hideLoading } = useLoading();
  const API = useAPI();
  const navigate = useNavigate();
  const { id } = useParams();

  const methods = useForm<BatchFormData>({
    mode: "onChange",
    defaultValues: {
      batch_name: "",
      batch_code: "",
      description: "",
      grouptest_id: "",
      grouptest: [],
      bu_id: "",
      bu_name: "",
      fm_id: "",
      fm_name: "",
      assessees: [],
      start_date: null,
      end_date: null,
      start_time: null,
      end_time: null,
      email_template_id: "",
      email_detail: [],
      is_mic: false,
      is_screenshot: false,
    },
    context: { activeTab, completedSteps },
  });

  // Log default values for debugging
  console.log("Default Values:", methods.getValues());

  const {
    formState: { errors },
  } = methods;

  const tabs: Array<{
    label: string;
    Component: React.FC<any>;
    fields: (keyof BatchFormData)[];
  }> = [
    {
      label: "Batch Overview",
      Component: BatchOverview,
      fields: ["batch_name", "batch_code", "description"],
      // fields: [],
    },
    {
      label: "Add Group Test",
      Component: AddGroupTest,
      fields: ["grouptest_id"],
      // fields: [],
    },
    {
      label: "Assignment",
      Component: Assignment,
      fields: ["bu_id", "fm_id", "assessees"],
      // fields: [],
    },
    {
      label: "Assignment Time",
      Component: AssignmentTime,
      fields: ["start_date", "end_date", "start_time", "end_time"],
      // fields: [],
    },
    {
      label: "Choose Email",
      Component: ChooseEmail,
      fields: [],
    },
    {
      label: "Settings",
      Component: Settings,
      fields: [],
    },
  ];

  const isStepCompleted = (stepIndex: number) => {
    const stepFields = tabs[stepIndex].fields;
    // Jika tidak ada field yang divalidasi, anggap step selesai
    if (stepFields.length === 0) return true;

    return stepFields.every(field => {
      // Jika field adalah array (grouptest atau assessees)
      if (field === "grouptest" || field === "assessees") {
        return methods.watch(field)?.length > 0;
      }

      // Untuk field biasa, cek apakah ada value dan tidak ada error
      const value = methods.watch(field);
      return !!value && !errors[field];
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
      }
    }
  };

  const handleSave = () => {
    methods.handleSubmit(data => onSubmit(data, false))();
  };

  const handleSaveAndPublish = () => {
    methods.handleSubmit(data => onSubmit(data, true))();
  };

  const handleBack = () => {
    if (activeTab > 0) {
      setActiveTab(activeTab - 1);
    }
  };

  // TODO: Implement fetch and set data for edit

  useEffect(() => {
    const fetchAndSetData = async () => {
      if (id) {
        showLoading();
        try {
          const { data: batch } = await API.get(`/batch/${id}`);
          const { data: assessee } = await API.get(`/batch/${id}/assessee`);
          methods.reset({
            ...batch.data,
            fm_id: batch.data.function_id,
            start_date: batch.data.start_period ? dayjs(batch.data.start_period) : null,
            end_date: batch.data.end_period ? dayjs(batch.data.end_period) : null,
            start_time: batch.data.start_period ? dayjs(batch.data.start_period) : null,
            end_time: batch.data.end_period ? dayjs(batch.data.end_period) : null,
          });
          const fetchedAssessees = assessee.data.map((item: any) => ({
            ...item,
            fromDB: true,
          }));
          methods.setValue("assessees", fetchedAssessees);
        } catch (error) {
          if (isAxiosError(error)) {
            snack.error(error.response?.data?.message || "Failed to fetch batch data");
          } else {
            snack.error("Failed to fetch batch data");
          }
        } finally {
          hideLoading();
        }
      }
    };
    fetchAndSetData();
  }, [id]);

  // TODO: Implement onSubmit edit

  const onSubmit = async (data: BatchFormData, publish: boolean) => {
    showLoading();
    try {
      const payloadBatch = {
        batch_name: data.batch_name,
        batch_code: data.batch_code,
        description: data.description,
        grouptest_id: data.grouptest_id,
        bu_id: data.bu_id,
        function_id: data.fm_id,
        template_email_id: data.email_template_id,
        is_mic: data.is_mic,
        is_screenshot: data.is_screenshot,
        start_period:
          data.start_date && data.start_time
            ? dayjs(data.start_date)
                .hour(dayjs(data.start_time).hour())
                .minute(dayjs(data.start_time).minute())
                .second(0)
                .format("DD-MM-YYYY HH:mm:ss")
            : null,
        end_period:
          data.end_date && data.end_time
            ? dayjs(data.end_date)
                .hour(dayjs(data.end_time).hour())
                .minute(dayjs(data.end_time).minute())
                .second(0)
                .format("DD-MM-YYYY HH:mm:ss")
            : null,
      };

      const payloadAssessee = id
        ? data.assessees
            .filter((assessee: any) => !assessee.fromDB)
            .map((assessee: any) => ({
              assessee_nik: assessee.assessee_nik,
              assessee_name: assessee.assessee_name,
              assessee_email: assessee.assessee_email,
            }))
        : data.assessees.map((assessee: any) => ({
            assessee_nik: assessee.assessee_nik,
            assessee_name: assessee.assessee_name,
            assessee_email: assessee.assessee_email,
          }));

      if (id) {
        // Update existing batch
        const { data: res_batch } = await API.patch(`/batch/${id}`, payloadBatch);
        const batch_id = res_batch.data.id;

        // Tambah assessee baru saja
        if (payloadAssessee.length > 0) {
          await API.post(`/batch/${batch_id}/assessee`, payloadAssessee);
        }

        // Hanya publish jika parameter publish = true
        if (publish) {
          await API.post(`/batch/${batch_id}/published`);
        }

        snack.success("Batch updated successfully");
        navigate(-1);
        return;
      }

      // Jika mode create
      const { data: res_batch } = await API.post("/batch", payloadBatch);
      const batch_id = res_batch.data.id;

      // Tambah semua assessee
      if (payloadAssessee.length > 0) {
        await API.post(`/batch/${batch_id}/assessee`, payloadAssessee);
      }

      // Hanya publish jika parameter publish = true
      if (publish) {
        await API.post(`/batch/${batch_id}/published`);
      }

      snack.success("Batch created successfully");
      navigate(-1);
    } catch (error) {
      if (isAxiosError(error)) {
        snack.error(error.response?.data?.message || "Failed to create or update batch");
      } else {
        snack.error("Failed to create or update batch");
      }
    } finally {
      hideLoading();
    }
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
            {activeTab < tabs.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={<ArrowForward />}
                disabled={isNextDisabled}
              >
                Next
              </Button>
            ) : (
              <Stack direction="row" spacing={2}>
                <Button variant="outlined" color="success" onClick={handleSave}>
                  Save
                </Button>
                <Button variant="contained" color="success" onClick={handleSaveAndPublish}>
                  Save & Publish
                </Button>
              </Stack>
            )}
          </Stack>
        }
        goBack={<IconButton children={<ArrowBack />} onClick={() => navigate(-1)} />}
      >
        <TabPanel value={activeTab} index={0}>
          <BatchOverview control={methods.control} />
        </TabPanel>
        <TabPanel value={activeTab} index={1}>
          <AddGroupTest control={methods.control} batchData={methods.getValues()} />
        </TabPanel>
        <TabPanel value={activeTab} index={2}>
          <Assignment control={methods.control} />
        </TabPanel>
        <TabPanel value={activeTab} index={3}>
          <AssignmentTime control={methods.control} />
        </TabPanel>
        <TabPanel value={activeTab} index={4}>
          <ChooseEmail control={methods.control} batchData={methods.getValues()} />
        </TabPanel>
        <TabPanel value={activeTab} index={5}>
          <Settings control={methods.control} />
        </TabPanel>
      </Create>
    </FormProvider>
  );
};
export default BatchCreateEdit;
