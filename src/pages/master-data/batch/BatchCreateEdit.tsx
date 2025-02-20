// import {
//     Button,
//     Typography,
//     Box,
//     IconButton,
//     Autocomplete,
//     Grid,
//     Table,
//     TableContainer,
//     TableHead,
//     TableRow, TableCell, TableBody, RadioGroup, FormControlLabel, Paper
// } from "@mui/material";
// import {useEffect, useState} from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { useForm } from "react-hook-form";
// import useFetch from "@/hooks/useFetch";
// import useAPI from "@/hooks/useAPI";
// import { snack } from "@/providers/SnackbarProvider";
// import { useLoading } from "@/providers/LoadingProvider";
// import DialogComp from "@/components/Dialog";
// import TextFieldCtrl from "@/components/forms/TextField";
// import useDialog from "@/hooks/useDialog";
// import ArrowBackIcon from "@mui/icons-material/ArrowBack";
// import DeleteIcon from "@mui/icons-material/Delete";
// import CheckboxCtrl from "@/components/forms/Checkbox.tsx";
// import InfoIcon from "@mui/icons-material/Info";
// import {isAxiosError} from "axios";
// import {GroupTestDetail} from "@/types/MasterData.ts";
//
// const BatchCreateEdit = () => {
//     const { id } = useParams();
//     const isEdit = Boolean(id);
//     const API = useAPI();
//     const { showLoading, hideLoading } = useLoading();
//     const { isOpen, open, close } = useDialog();
//     const navigate = useNavigate();
//     const { data: batch, refetch: refetchBatch } = useFetch<GroupTestDetail>(isEdit ? `/batch/${id}` : null);
//     const { data: batchAssessee, refetch: refetchBatchAssessee } = useFetch<{ data: any[] }>(isEdit ? `/batch/${id}/assessee` : null);
//     const { isOpen: isOpenDelete, open: openDelete, close: closeDelete } = useDialog();
//     const [selectedRows, setSelectedRows] = useState({});
//     const [selectedTest, setSelectedTest] = useState<{ id: string; test_name: string } | null>(null);
//
//
//     const {
//         control,
//         handleSubmit,
//         trigger,
//         reset
//     } = useForm({
//         defaultValues: {
//             batch_name: "",
//             batch_code: "",
//             grouptest_id: "",
//             bu_id: "",
//             template_email_id: "",
//             start_period: "",
//             end_period: "",
//             is_mic: "",
//             is_screenshot: "",
//             note: ""
//         }
//     });
//
//     useEffect(() => {
//         if(!grouptest) return
//         if(isEdit && grouptest) {
//             reset({
//                 grouptest_name: grouptest?.data.grouptest_name,
//                 grouptest_code: grouptest?.data.grouptest_code,
//                 is_active: grouptest?.data.is_active
//             });
//         }
//     }, [isEdit, grouptest]);
//
//
//     const handleOpenDelete = (id: string, test_name: string)=> {
//         setSelectedTest({id, test_name});
//         openDelete()
//     }
//
//     const onSubmit = async (values: any) => {
//         showLoading();
//         try {
//             const payload = {
//                 grouptest_name: values.grouptest_name,
//                 grouptest_code: values.grouptest_code,
//                 is_active: values.is_active,
//                 tests: Object.keys(selectedRows).map((id) => ({
//                     test_id: id
//                 }))
//             };
//
//             if (isEdit) {
//                 await API.patch(`/grouptest/${id}`, payload);
//                 snack.success("Group Test is successfully updated");
//                 refetchGroupTest();
//                 refetchAvailableTest();
//             } else {
//                 delete payload.is_active;
//                 await API.post("/grouptest", payload);
//                 snack.success("Group Test is successfully created");
//                 navigate(-1);
//             }
//             refetchGroupTest();
//         } catch {
//             snack.error("Terjadi kesalahan");
//         } finally {
//             hideLoading();
//         }
//     };
//
//     const handleDelete = async (id: string, detailId: string) => {
//         showLoading();
//         try {
//             const res = await API.delete(`/grouptest/${id}/tests/${detailId}`);
//             refetchGroupTest();
//             refetchAvailableTest();
//             snack.success(res.data?.message);
//         } catch (error) {
//             if (isAxiosError(error)) {
//                 const data = error.response?.data;
//                 snack.error(data?.message || "Terjadi kesalahan");
//             } else {
//                 snack.error("Error, check log for details");
//             }
//         } finally {
//             closeDelete();
//             hideLoading();
//         }
//     };
//
//     return (
//         <>
//             <Grid>
//                 <TextFieldCtrl control={control} name="batch_name" label="Name"/>
//                 <TextFieldCtrl control={control} name="batch_code" label="Code"/>
//             </Grid>
//             <Grid>
//                 <Autocomplete renderInput={} options={} />
//                 <Autocomplete renderInput={} options={} />
//                 <Button>Email Template
//                     {/*{*/}
//                     {/*    isSelected? */}
//                     {/*}*/}
//                 </Button>
//             </Grid>
//
//             <Grid container spacing={2}>
//                 <Grid item xs={12}>
//                     <Typography variant="h6" fontWeight="bold" color="red">
//                         Proctoring (Pengawasan)
//                     </Typography>
//                 </Grid>
//                 <Grid item xs={12}>
//                     <TableContainer component={Paper()}>
//                         <Table>
//                             <TableHead>
//                                 <TableRow style={{ backgroundColor: "darkred", color: "white" }}>
//                                     <TableCell style={{ color: "white", fontWeight: "bold" }}> </TableCell>
//                                     <TableCell style={{ color: "white", fontWeight: "bold" }}>Mandatory Active</TableCell>
//                                 </TableRow>
//                             </TableHead>
//                             <TableBody>
//                                 {[
//                                     { label: "Camera", options: ["Yes", "-"] },
//                                     { label: "Mic", options: ["Yes", "No"] },
//                                     { label: "Screenshot", options: ["Yes", "No"] },
//                                 ].map((row, index) => (
//                                     <TableRow key={index}>
//                                         <TableCell>{row.label} :</TableCell>
//                                         <TableCell>
//                                             <RadioGroup row>
//                                                 {row.options.map((option, i) => (
//                                                     <FormControlLabel key={i} value={option} control={<Radio />} label={option} />
//                                                 ))}
//                                             </RadioGroup>
//                                         </TableCell>
//                                     </TableRow>
//                                 ))}
//                             </TableBody>
//                         </Table>
//                     </TableContainer>
//                 </Grid>
//             </Grid>
//
//
//             {/*<Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 1 }}>*/}
//             {/*    <IconButton onClick={() => navigate(-1)}>*/}
//             {/*        <ArrowBackIcon />*/}
//             {/*    </IconButton>*/}
//             {/*    <Typography variant="h2" color="primary">*/}
//             {/*        {isEdit ? "Edit" : "New"} Batch*/}
//             {/*    </Typography>*/}
//             {/*</Box>*/}
//
//             {/*<Box sx={{ display: "flex", alignItems: "center", mb: 0.5, gap: 1 }}>*/}
//             {/*    <TextFieldCtrl name="grouptest_name" control={control} label="Name" rules={{ required: "Field required" }} />*/}
//             {/*    <TextFieldCtrl name="grouptest_code" control={control} label="Code" rules={{ required: "Field required" }} />*/}
//             {/*</Box>*/}
//
//
//             {/*{isEdit ? (*/}
//             {/*    <>*/}
//             {/*        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>*/}
//             {/*            <CheckboxCtrl name="is_active" control={control} label="Active" />*/}
//             {/*            <Typography variant="h6">Taken Tests</Typography>*/}
//             {/*            <MaterialReactTable table={selectedTable} />*/}
//             {/*            <Typography variant="h6">Available Tests</Typography>*/}
//             {/*            <MaterialReactTable table={availableTable} />*/}
//             {/*        </Box>*/}
//             {/*    </>*/}
//             {/*) : (*/}
//             {/*    <>*/}
//             {/*        <Typography variant="h6">Tests</Typography>*/}
//             {/*        <MaterialReactTable table={allTable} />*/}
//             {/*    </>*/}
//             {/*)}*/}
//
//             {/*<Box textAlign="right" mt={4}>*/}
//             {/*    <Button*/}
//             {/*        variant="contained"*/}
//             {/*        onClick={async () => {*/}
//             {/*            const valid = await trigger();*/}
//             {/*            if (valid) open();*/}
//             {/*        }}*/}
//             {/*    >*/}
//             {/*        Save*/}
//             {/*    </Button>*/}
//             {/*</Box>*/}
//
//             {/*<DialogComp title={isEdit ? "Edit Group Test" : "Create Group Test"} open={isOpen} onClose={close} actions={[*/}
//             {/*    <Button onClick={close} variant="outlined" color="error">Cancel</Button>,*/}
//             {/*    <Button onClick={handleSubmit(onSubmit)} variant="contained" color="error">{isEdit ? "Edit" : "Create"}</Button>*/}
//             {/*]}>*/}
//             {/*    <Typography>{`Apakah Anda yakin ingin ${isEdit ? "mengedit" : "membuat"} Group Test?`}</Typography>*/}
//             {/*</DialogComp>*/}
//
//             {/*<DialogComp*/}
//             {/*    title="Delete Selected Test"*/}
//             {/*    open={isOpenDelete}*/}
//             {/*    onClose={closeDelete}*/}
//             {/*    actions={*/}
//             {/*        <>*/}
//             {/*            <Button onClick={closeDelete} variant="outlined" color="error">*/}
//             {/*                Cancel*/}
//             {/*            </Button>*/}
//             {/*            {selectedTest && (*/}
//             {/*                <Button*/}
//             {/*                    onClick={() => handleDelete(id!, selectedTest?.id)}*/}
//             {/*                    variant="contained"*/}
//             {/*                    color="error">*/}
//             {/*                    Delete*/}
//             {/*                </Button>*/}
//             {/*            )}*/}
//             {/*        </>*/}
//             {/*    }*/}
//             {/*>*/}
//             {/*    {selectedTest && (*/}
//             {/*        <Typography>{`Are you sure you want to delete ${selectedTest.test_name}?`}</Typography>*/}
//             {/*    )}*/}
//             {/*</DialogComp>*/}
//         </>
//     );
// };
//
// export default BatchCreateEdit;
