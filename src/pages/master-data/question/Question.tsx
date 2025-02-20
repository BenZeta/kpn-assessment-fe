import DialogComp from "@/components/Dialog";
import CreateQuestionForm from "@/components/question/CreateQuestionForm";
import { TableSkeleton } from "@/components/Skeleton";
import StandardTable from "@/components/StandardTable";
import useAPI from "@/hooks/useAPI";
import useAuthStore from "@/hooks/useAuthStore";
import useDialog from "@/hooks/useDialog";
import useFetch from "@/hooks/useFetch";
import { useLoading } from "@/providers/LoadingProvider";
import { snack } from "@/providers/SnackbarProvider";
import { truncateText } from "@/utils/helper";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InfoIcon from "@mui/icons-material/Info";
import { Box, Button, IconButton, Typography } from "@mui/material";
import { isAxiosError } from "axios";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CreateEditQuestion from "./CreateEditQuestion";

interface QuestionFormData {
  question: string;
  category_id: string;
  answers: Array<{
    text: string;
    point: number;
    image?: File ;
  }>;
  questionImage?: File | undefined;
}

const Question = () => {
  const API = useAPI();
  const navigate = useNavigate();
  const getPermission = useAuthStore((state) => state.getPermission);
  const { data: question, refetch } = useFetch<any>("/question");
  const [selected, setSelected] = useState("");
  const { showLoading, hideLoading } = useLoading();
  const { open, isOpen, close } = useDialog();
  const { close: closeCreate } = useDialog();
  const user_id = useAuthStore((state) => state.user_id);

  const handleOpenModal = () => {
    open();
  };

  const handleSubmitQuestion = async (data: QuestionFormData) => {
    try {
      showLoading();
      const formData = new FormData();

      formData.append("created_by", user_id);
      formData.append("q_input_text", data.question);
      formData.append("category_id", data.category_id);

      if (data.questionImage) {
        formData.append("q_input_image", data.questionImage);
      }

      data.answers.forEach((answer, index) => {
        formData.append(`answers[${index}][text]`, answer.text);
        formData.append(`answers[${index}][point]`, answer.point.toString());
        if(answer.image) {
          formData.append(`answers[${index}][image]`, answer.image);
        }
      });

      // const response = await API.post("/question", formData, {
      //   headers: {
      //     "Content-Type": "multipart/form-data",
      //   },
      // });

      // console.log("response: ", response);

      snack.success("Question created successfully");
      refetch();
      closeCreate();
    } catch (error) {
      console.error("Error creating question", error);
      if (isAxiosError(error)) {
        snack.error(error.response?.data.message || "Error creating question");
      } else {
        snack.error("An unexpected error occurred");
      }
    } finally {
      hideLoading();
    }
  };

  const columns: any = useMemo(
    () => [
      {
        header: () => null,
        id: "expander",
        cell: ({ row }: { row: any }) => {
          return row.getCanExpand() ? (
            <IconButton
              {...{
                onClick: row.getToggleExpandedHandler(),
              }}
            >
              {row.getIsExpanded() ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          ) : null;
        },
      },
      {
        header: "Layout",
        accessorKey: "q_layout_type",
        cell: (props: any) => props.getValue(),
      },
      {
        header: "Question",
        accessorKey: "q_input_text",
        cell: (props: any) => (
          <>
            {props.getValue() ? (
              truncateText(props.getValue(), 100)
            ) : (
              <Typography color="text.secondary" fontStyle="italic">
                no text
              </Typography>
            )}
          </>
        ),
      },
      {
        header: "Question Image",
        accessorKey: "q_input_image_url",
        cell: (props: any) => (
          <Box sx={{ height: 100, display: "flex", alignItems: "center" }}>
            {props.getValue() ? (
              <img
                height={100}
                src={`${
                  import.meta.env.VITE_API_URL
                }/static/question/${props.getValue()}`}
                alt="Cannot load image"
              />
            ) : (
              <Typography color="text.secondary" fontStyle="italic">
                no image
              </Typography>
            )}
          </Box>
        ),
      },
      {
        header: "Answer Type",
        accessorKey: "answer_type",
        cell: (props: any) => props.getValue(),
      },
      {
        header: "Created By",
        accessorKey: "created_by",
        cell: (props: any) => props.getValue(),
      },
      {
        header: "Action",
        accessorKey: "id",
        meta: { align: "right" },
        cell: (props: any) => (
          <Box sx={{ display: "flex", gap: 2, justifyContent: "end" }}>
            {getPermission("fupdate", 7) && (
              <IconButton
                onClick={() =>
                  navigate(`/admin/question/edit/${props.row.original.id}`)
                }
                aria-label="edit"
                size="small"
                edge="end"
                // color="warning"
              >
                <EditIcon />
              </IconButton>
            )}
            {getPermission("fdelete", 7) && (
              <IconButton
                onClick={() => handleOpen(props.row.original.id)}
                aria-label="delete"
                size="small"
                edge="end"
                // color="error"
              >
                <DeleteIcon />
              </IconButton>
            )}
            <IconButton
              onClick={() =>
                navigate(`/admin/question/${props.row.original.id}`)
              }
              aria-label="detail"
              size="small"
              edge="end"
            >
              <InfoIcon />
            </IconButton>
          </Box>
        ),
      },
    ],
    []
  );

  const answerColumns: any = useMemo(
    () => [
      {
        header: "Answer",
        accessorKey: "text",
        cell: (props: any) => (
          <>
            {props.getValue() ? (
              truncateText(props.getValue(), 100)
            ) : (
              <Typography color="text.secondary" fontStyle="italic">
                no text
              </Typography>
            )}
          </>
        ),
      },
      {
        header: "Answer Image",
        accessorKey: "image_url",
        cell: (props: any) => (
          <Box sx={{ height: 75, display: "flex", alignItems: "center" }}>
            {props.getValue() ? (
              <img
                height={75}
                src={`${
                  import.meta.env.VITE_API_URL
                }/static/question/${props.getValue()}`}
                alt="Cannot load image"
              />
            ) : (
              <Typography color="text.secondary" fontStyle="italic">
                no image
              </Typography>
            )}
          </Box>
        ),
      },
      {
        header: "Point",
        accessorKey: "point",
        cell: (props: any) => props.getValue(),
      },
    ],
    []
  );

  const handleOpen = (id: string) => {
    setSelected(id);
    open();
  };

  const handleDelete = async () => {
    showLoading();
    const url = `/question/${selected}`;

    try {
      const res = await API.delete(url);
      snack.success(`${res.data.message}`);
      refetch();
    } catch (error) {
      if (isAxiosError(error)) {
        const data = error.response?.data;
        snack.error(data.message);
      } else {
        snack.error("Error");
      }
      console.error(error);
    } finally {
      close();
      hideLoading();
    }
  };

  const answerTable = ({ row }: { row: any }) => {
    return (
      <>
        <StandardTable columns={answerColumns} data={row.original.answers} />
      </>
    );
  };

  return (
    <>
      <Typography variant="h1" color="primary">
        Question
        {getPermission("fcreate", 7) && (
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            sx={{ ml: 2 }}
            // onClick={handleOpenModal}
            onClick={handleOpenModal}
          >
            Create Question
          </Button>
        )}
      </Typography>

      {question ? (
        getPermission("fread", 7) && (
          <StandardTable
            columns={columns}
            data={question?.data}
            renderSubComponent={answerTable}
          />
        )
      ) : (
        <TableSkeleton column={4} row={2} small />
      )}

      <DialogComp
        title={`Delete Question`}
        open={isOpen}
        onClose={close}
        actions={
          <>
            <Button onClick={close} variant="outlined" color="error">
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
        open={isOpen}
        onClose={close}
        maxWidth="md"
        formId="create-question-form"
        actions={
          <Button onClick={close} variant="outlined" color="error">
            Cancel
          </Button>
        }
      >
        {/* <CreateQuestionForm
          id="create-question-form"
          onSubmit={handleSubmitQuestion}
        /> */}
        <CreateEditQuestion />
      </DialogComp>
    </>
  );
};
export default Question;
