import CustomTable, { CustomTableColumn } from "@/components/CustomTable";
import DialogComp from "@/components/Dialog";
import { TableSkeleton } from "@/components/Skeleton";
import useAPI from "@/hooks/useAPI";
import useAuthStore from "@/hooks/useAuthStore";
import useDialog from "@/hooks/useDialog";
import useFetch from "@/hooks/useFetch";
import { useLoading } from "@/providers/LoadingProvider";
import { snack } from "@/providers/SnackbarProvider";
import theme from "@/theme";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import InfoIcon from "@mui/icons-material/Info";
import { Box, Button, IconButton, Tooltip, Typography } from "@mui/material";
import { isAxiosError } from "axios";
import dayjs from "dayjs";
import parse from "html-react-parser";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CreateEditQuestion from "./CreateEditQuestion";

const Question = () => {
  const API = useAPI();
  const navigate = useNavigate();
  const getPermission = useAuthStore(state => state.getPermission);
  const { data: question, refetch } = useFetch<any>("/question");
  const [selected, setSelected] = useState("");
  const { showLoading, hideLoading } = useLoading();
  const [editId, setEditId] = useState<string | null>(null);
  const { open: openEdit, isOpen: isOpenEdit, close: closeEdit } = useDialog();
  const { open: openDelete, isOpen: isOpenDelete, close: closeDelete } = useDialog();
  const { open: openCreate, isOpen: isOpenCreate, close: closeCreate } = useDialog();
  const {
    open: openConfirmDiscard,
    isOpen: isConfirmDiscardOpen,
    close: closeConfirmDiscard,
  } = useDialog();

  // Track unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [pendingClose, setPendingClose] = useState<(() => void) | null>(null);

  console.log("question", question);
  const handleOpenModal = () => {
    openCreate();
  };

  const handleOpenEdit = (id: string) => {
    setEditId(id);
    openEdit();
  };

  const handleCreateSuccess = () => {
    setHasUnsavedChanges(false); // Clear unsaved changes on success
    refetch();
    closeCreate(); // Close modal after successful creation
  };

  const handleEditSuccess = () => {
    setHasUnsavedChanges(false); // Clear unsaved changes on success
    refetch();
    closeEdit(); // Close modal after successful edit
  };

  const handleCloseWithUnsavedCheck = (closeFunction: () => void) => {
    if (hasUnsavedChanges) {
      setPendingClose(() => closeFunction);
      openConfirmDiscard();
    } else {
      closeFunction();
    }
  };

  const confirmDiscardChanges = () => {
    setHasUnsavedChanges(false);
    closeConfirmDiscard();
    if (pendingClose) {
      pendingClose();
      setPendingClose(null);
    }
  };

  const columns: CustomTableColumn<any>[] = [
    {
      header: "Created At",
      accessorKey: "created_at",
      renderCell: (row: any) => {
        return dayjs(row.created_at).format("DD MMM YYYY");
      },
      enableColumnFilter: false,
    },
    {
      header: "Question",
      accessorKey: "q_input_text",
      renderCell: (row: any) => (
        <div style={{ maxHeight: "10rem", overflow: "auto" }}>
          {row.q_input_text ? (
            parse(row.q_input_text)
          ) : (
            <Typography color="text.secondary" fontStyle="italic">
              no text
            </Typography>
          )}
        </div>
      ),
      enableColumnFilter: false,
    },
    {
      header: "Question Image",
      accessorKey: "q_input_image_url",
      renderCell: (row: any) => (
        <Box sx={{ height: 100, display: "flex", alignItems: "center" }}>
          {row.q_input_image_url ? (
            <img
              height={100}
              src={`${import.meta.env.VITE_API_URL}/static/question/${row.q_input_image_url}`}
              alt="Cannot load image"
            />
          ) : (
            <Typography color="text.secondary" fontStyle="italic">
              no image
            </Typography>
          )}
        </Box>
      ),
      enableColumnFilter: false,
    },
    {
      header: "Category",
      accessorKey: "category_name",
      enableSorting: true,
      renderCell: (row: any) => (
        <>
          {row.category_name ? (
            row.category_name
          ) : (
            <Typography color="text.secondary" fontStyle="italic">
              no category
            </Typography>
          )}
        </>
      ),
      filterVariant: "autocomplete",
    },
    {
      header: "Answer Type",
      accessorKey: "answer_type",
      renderCell: (row: any) => row.answer_type,
      enableColumnFilter: false,
    },
    {
      header: "Created By",
      accessorKey: "created_by",
      renderCell: (row: any) => row.created_by,
      enableColumnFilter: false,
    },
    {
      header: "Action",
      accessorKey: "id",
      muiTableHeadCellProps: { align: "center" },
      muiTableBodyCellProps: { align: "center" },
      enableColumnFilter: false,
      renderCell: (row: any) => (
        <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
          {getPermission("fupdate", 5) && (
            <Tooltip title="Edit Question" placement="top" arrow>
              <IconButton
                onClick={() => handleOpenEdit(row.id)}
                aria-label="edit"
                size="small"
                edge="end"
              >
                <EditIcon sx={{ color: "secondary.dark" }} />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="View Details" placement="top" arrow>
            <IconButton
              onClick={() => navigate(`/admin/question/${row.id}`)}
              aria-label="detail"
              size="small"
              edge="end"
            >
              <InfoIcon sx={{ color: "info.light" }} />
            </IconButton>
          </Tooltip>
          {getPermission("fdelete", 6) && (
            <Tooltip title="Delete Question" placement="top" arrow>
              <IconButton
                onClick={() => handleOpen(row.id)}
                aria-label="delete"
                size="small"
                edge="end"
              >
                <DeleteIcon sx={{ color: "primary.main" }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      ),
    },
  ];

  const handleOpen = (id: string) => {
    setSelected(id);
    openDelete();
  };

  const handleDelete = async () => {
    showLoading();
    const url = `/question/${selected}`;

    try {
      await API.delete(url);
      snack.success("Question deleted successfully");
      refetch();
    } catch (error) {
      if (isAxiosError(error)) {
        const data = error.response?.data;
        snack.error("Something went wrong: " + data.message);
      } else {
        snack.error("Error");
      }
      console.error(error);
    } finally {
      closeDelete();
      hideLoading();
    }
  };

  return (
    <Box
      sx={{
        p: 3,
        height: "100%",
        bgcolor: theme.palette.background.paper,
        borderRadius: 2,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h1" color="primary">
          Question
        </Typography>
        {getPermission("fcreate", 7) && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ ml: 2 }}
            onClick={handleOpenModal}
          >
            Create Question
          </Button>
        )}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0, overflow: "auto" }}>
        {question ? (
          <CustomTable
            columns={columns}
            data={question?.data}
            hasPermission={getPermission("fread", 7)}
            isLoading={!question}
            enableFilters={true}
            enableFacetedValues
            enableColumnFilters
          />
        ) : (
          <TableSkeleton column={4} row={2} small />
        )}
      </Box>

      <DialogComp
        title={`Delete Question`}
        open={isOpenDelete}
        onClose={closeDelete}
        actions={
          <>
            <Button onClick={closeDelete} variant="outlined" color="error">
              Cancel
            </Button>
            <Button onClick={handleDelete} variant="contained" color="error">
              Delete
            </Button>
          </>
        }
      >
        <Typography>{`Are you sure you want to delete this question?`}</Typography>
      </DialogComp>
      <DialogComp
        title="Create Question"
        open={isOpenCreate}
        onClose={() => handleCloseWithUnsavedCheck(closeCreate)}
        maxWidth="lg"
        formId="question-form"
        actions={
          <Button
            onClick={() => handleCloseWithUnsavedCheck(closeCreate)}
            variant="outlined"
            color="error"
          >
            Cancel
          </Button>
        }
      >
        <CreateEditQuestion onSuccess={handleCreateSuccess} onFormChange={setHasUnsavedChanges} />
      </DialogComp>

      <DialogComp
        title="Edit Question"
        open={isOpenEdit}
        onClose={() => handleCloseWithUnsavedCheck(closeEdit)}
        maxWidth="lg"
        formId="question-form-edit"
        actions={
          <Button
            onClick={() => handleCloseWithUnsavedCheck(closeEdit)}
            variant="outlined"
            color="error"
          >
            Cancel
          </Button>
        }
      >
        <CreateEditQuestion
          id={editId}
          onSuccess={handleEditSuccess}
          formId="question-form-edit"
          onFormChange={setHasUnsavedChanges}
        />
      </DialogComp>

      <DialogComp
        title="Unsaved Changes"
        open={isConfirmDiscardOpen}
        onClose={closeConfirmDiscard}
        actions={
          <>
            <Button onClick={closeConfirmDiscard} variant="outlined" color="primary">
              Keep Editing
            </Button>
            <Button onClick={confirmDiscardChanges} variant="contained" color="error">
              Discard Changes
            </Button>
          </>
        }
      >
        <Typography>
          You have unsaved changes. Are you sure you want to discard them and close?
        </Typography>
      </DialogComp>
    </Box>
  );
};
export default Question;
