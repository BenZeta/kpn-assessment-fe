import useDialog from "@/hooks/useDialog";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import RemoveIcon from "@mui/icons-material/Remove";
import {
  Box,
  Button,
  Collapse,
  Divider,
  Grid2 as Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { Control, Controller, useFormContext } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import DialogComp from "../Dialog";

type AddGroupTestProps = {
  control: Control<any>;
  batchData: any;
};

const dummyGroupTests = [
  {
    id: "857c4c5d-eafe-49bc-a787-c9f5a82c117f",
    grouptest_name: "Matematika Dasar",
    grouptest_code: "MTK101",
    is_active: true,
    created_by: "Admin",
    created_at: "2025-01-21T09:15:46.686Z",
    test_count: "2",
  },
];

const dummyGroupTestDetails = {
  id: "857c4c5d-eafe-49bc-a787-c9f5a82c117f",
  grouptest_name: "Matematika Dasar",
  grouptest_code: "MTK101",
  is_active: true,
  created_by: "Admin",
  updated_by: "Admin",
  updated_at: "2025-01-21T09:15:46.686Z",
  tests: [
    {
      id: "06a2faa8-253b-4787-8fc6-4f365d5b1085",
      test_id: 1,
      test_name: "Ajabar Linear",
      test_code: "MAT101",
      added_by: "Admin",
      added_at: "2025-01-21T09:07:46.419Z",
    },
    {
      id: "f30bd003-fc51-428a-9f56-8f416ed9e707",
      test_id: 2,
      test_name: "Kalkulus",
      test_code: "MAT102",
      added_by: "Admin",
      added_at: "2025-01-21T09:07:46.419Z",
    },
  ],
};

const AddGroupTest: React.FC<AddGroupTestProps> = ({ control, batchData }) => {
  const { open, isOpen, close } = useDialog();
  const { setValue, watch } = useFormContext();
  const navigate = useNavigate();
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const selectedGroupTests = watch("grouptest_id") || [];
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [expandedSelectedGroup, setExpandedSelectedGroup] = useState<
    string | null
  >(null);

  const handleSelectGroup = (group: any) => {
    setSelectedGroup(group);
  };
  console.log("grup terpilih: ", selectedGroup);

  const handleRemoveGroupTest = (groupId: string) => {
    const updatedGroups = selectedGroupTests.filter(
      (group: any) => group.id !== groupId
    );
    setValue("grouptest_id", updatedGroups); // Simpan ke form context
  };

  const handleAddGroupTest = () => {
    if (selectedGroup) {
      const updatedGroups = [...selectedGroupTests, selectedGroup];
      setValue("grouptest_id", updatedGroups); // Simpan ke form context
      close();
    }
  };
  return (
    <>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" color="textSecondary" fontWeight={600}>
          {batchData.batch_code}
        </Typography>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          {batchData.batch_name}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {batchData.description}
        </Typography>
      </Box>
      <Divider sx={{ my: 2 }} />
      <Typography
        variant="h6"
        color="textSecondary"
        fontWeight={600}
        gutterBottom
      >
        Group Test
      </Typography>
      {selectedGroupTests.length > 0 ? (
        <Box>
          {selectedGroupTests.map((group: any) => (
            <Controller
              key={group.id}
              name="grouptest_id"
              control={control}
              defaultValue={group.id}
              render={({ field }) => (
                <Box {...field} key={group.id} sx={{ my: 2 }}>
                  <Typography variant="h6" fontWeight={600}>
                    {group.grouptest_name}
                  </Typography>
                  <List>
                    {dummyGroupTestDetails.tests.map((test, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={test.test_name} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            />
          ))}
        </Box>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            my: 4,
          }}
        >
          <Button
            variant="outlined"
            onClick={() => navigate("/admin/grouptest/create")}
          >
            Create Group Test
          </Button>
          <Typography variant="body2" color="textSecondary" fontWeight={600}>
            OR
          </Typography>
          <Button variant="contained" onClick={open}>
            Sellect Existing Group Test
          </Button>
        </Box>
      )}

      <DialogComp
        title="Select Group Test"
        open={isOpen}
        onClose={close}
        actions={
          <>
            <Button variant="outlined" onClick={close}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                handleAddGroupTest();
              }}
              disabled={!selectedGroup}
            >
              Add
            </Button>
          </>
        }
      >
        <Box sx={{ border: "1px solid blue" }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  Group Test
                </Typography>
                <List>
                  {dummyGroupTests.map((group) => (
                    <>
                      <ListItem
                        key={group.id}
                        component="div"
                        onClick={() =>
                          setExpandedGroup(
                            expandedGroup === group.id ? null : group.id
                          )
                        }
                      >
                        <ListItemText primary={group.grouptest_name} />
                        <IconButton>
                          {expandedGroup === group.id ? (
                            <RemoveIcon />
                          ) : (
                            <ExpandMoreIcon />
                          )}
                        </IconButton>
                        <IconButton
                          disabled={selectedGroup?.id === group.id}
                          onClick={() => handleSelectGroup(group)}
                        >
                          <AddIcon />
                        </IconButton>
                      </ListItem>
                      <Collapse
                        in={expandedGroup === group.id}
                        timeout="auto"
                        unmountOnExit
                      >
                        <List component="div" disablePadding>
                          {dummyGroupTestDetails.tests.map((test, index) => (
                            <ListItem key={index} sx={{ pl: 4 }}>
                              <ListItemText
                                primary={test.test_name || "Unnamed Test"}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Collapse>
                    </>
                  ))}
                </List>
              </Box>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  Selected Group Test
                </Typography>
                <List>
                  {selectedGroup && (
                    <>
                      <ListItem
                        component="div"
                        onClick={() =>
                          setExpandedSelectedGroup(
                            expandedSelectedGroup === selectedGroup.id
                              ? null
                              : selectedGroup.id
                          )
                        }
                      >
                        <ListItemText primary={selectedGroup.grouptest_name} />
                        <IconButton>
                          {expandedSelectedGroup === selectedGroup.id ? (
                            <RemoveIcon />
                          ) : (
                            <ExpandMoreIcon />
                          )}
                        </IconButton>
                        <IconButton
                          onClick={() =>
                            handleRemoveGroupTest(selectedGroup.id)
                          }
                        >
                          <CloseIcon />
                        </IconButton>
                      </ListItem>
                      <Collapse
                        in={expandedSelectedGroup === selectedGroup.id}
                        timeout="auto"
                        unmountOnExit
                      >
                        <List component="div" disablePadding>
                          {dummyGroupTestDetails.tests.map((test, index) => (
                            <ListItem key={index}>
                              <ListItemText
                                primary={test.test_name || "Unnamed Test"}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Collapse>
                    </>
                  )}
                </List>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </DialogComp>
    </>
  );
};
export default AddGroupTest;
