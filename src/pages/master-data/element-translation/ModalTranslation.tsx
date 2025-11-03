import { forwardRef, useImperativeHandle, useState, useRef, useMemo, useEffect } from "react";
import CustomTable, { CustomTableColumn } from "@/components/CustomTable";
import { ElementTranslation, LanguageMaster } from "@/types/MasterData";
import { MRT_Row, MRT_TableOptions, MRT_TableProps } from "material-react-table";
import { Box, Dialog, IconButton, Tooltip, Button, TextField } from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import DialogFormConfirmation, {
  RefDialogConfirmation,
} from "@/components/common/DialogFormConfirmation";
import useAPI from "@/hooks/useAPI";
import { snack } from "@/providers/SnackbarProvider";
import { isAxiosError } from "axios";
import useFetch from "@/hooks/useFetch";

interface TranslationRefInterface {
  isDirty: boolean;
}

interface TranslationInterface {
  data: ElementTranslation[];
}

interface DeleteConfirmationModalRefInterface {
  openDeleteConfirmModal: (row: MRT_Row<ElementTranslation>) => void;
}

const DeleteConfirmationModal = forwardRef<DeleteConfirmationModalRefInterface>((props, ref) => {
  const api = useAPI();
  const [data, setData] = useState<MRT_Row<ElementTranslation>>();
  const modalConf = useRef<RefDialogConfirmation>(null);
  useImperativeHandle(ref, () => ({
    openDeleteConfirmModal: row => {
      modalConf.current?.setOpen(true);
      setData(row);
    },
  }));
  const onYes = async () => {
    try {
      console.log("delete");
      console.log(data);
      setTimeout(() => {}, 1000);
      modalConf.current?.setOpen(false);
      snack.success("Delete Success");
    } catch (error) {
      console.error(error);
      let errmsg = "";
      if (isAxiosError(error)) {
        errmsg = error.response?.data.message;
      } else {
        errmsg = (error as Error).message;
      }
      snack.error(errmsg);
    }
  };
  const onNo = () => {
    modalConf.current?.setOpen(false);
  };

  return (
    <DialogFormConfirmation
      ref={modalConf}
      onYes={onYes}
      onNo={onNo}
      Title={
        <h4>
          Delete Translation {data?.original.language_id} - {data?.original.element_id}
        </h4>
      }
      Content={
        <p>
          Are you sure want to delete {data?.original.language_id} - {data?.original.element_id} ?
        </p>
      }
    />
  );
});

export const ModalTranslation = forwardRef<TranslationRefInterface, TranslationInterface>(
  ({ data }, ref) => {
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const { data: dtLanguage } = useFetch<{ data: LanguageMaster[] }>("/languages");
    const [isDirty, setIsDirty] = useState(false);
    const [tempData, setTempData] = useState<ElementTranslation[]>(data);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const DialogDeleteRef = useRef<DeleteConfirmationModalRefInterface | null>(null);
    const openDeleteConfirmModal = (row: MRT_Row<ElementTranslation>) => {
      DialogDeleteRef.current?.openDeleteConfirmModal(row);
    };
    useImperativeHandle(ref, () => ({
      isDirty: isDirty,
    }));

    const existedLang: Set<string> = useMemo(() => {
      const NewExistedLang: Set<string> = new Set();
      tempData.forEach(value => {
        NewExistedLang.add(value.language_id);
      });
      return NewExistedLang;
    }, [tempData]);

    const languageOpt = useMemo(() => {
      return dtLanguage?.data.map(item => {
        return {
          value: item.language_code,
          label: `${item.language_name} (${item.language_name_native}) `,
        };
      });
    }, [dtLanguage]);

    const renderRowActions: MRT_TableOptions<ElementTranslation>["renderRowActions"] = ({
      row,
      table,
    }) => {
      return (
        <Box sx={{ display: "flex" }}>
          <Tooltip title="Edit">
            <IconButton onClick={() => table.setEditingRow(row)}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton color="error" onClick={() => openDeleteConfirmModal(row)}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      );
    };

    const onEditingRowSave: MRT_TableOptions<ElementTranslation>["onEditingRowSave"] = async ({
      values,
      table,
      row,
    }) => {
      const id = row.original.id;
      setTempData(prev => {
        return prev.map(item => {
          if (item.language_id == values.language_id) {
            return { ...item, description: values.description };
          } else {
            return item;
          }
        });
      });
      console.log(id);
      console.log(values);
      table.setEditingRow(null);
    };
    const onCreatingRowSave: MRT_TableOptions<ElementTranslation>["onCreatingRowSave"] = async ({
      values,
    }) => {
      console.log(values);
      console.log(existedLang);
      if (existedLang.has(values.language_id)) {
        setValidationErrors(prev => ({ ...prev, language_id: "Duplicate language not allowed" }));
      }
    };

    useEffect(() => {
      console.log(validationErrors);
    }, [validationErrors]);
    const renderTopToolbar: MRT_TableOptions<ElementTranslation>["renderTopToolbarCustomActions"] =
      ({ table }) => {
        return (
          <Button
            variant="contained"
            onClick={() => {
              table.setCreatingRow(true);
            }}
          >
            + Add
          </Button>
        );
      };

    const column: CustomTableColumn<ElementTranslation>[] = [
      {
        header: "Language",
        accessorKey: "language_id",
        editVariant: "select",
        editSelectOptions: languageOpt,
        Cell: ({ row }) => {
          const data = row.original;
          return `${data.language_name} (${data.language_name_native})`;
        },
        muiEditTextFieldProps: ({ row }) => ({
          select: true,
          disabled: !!row.original.id, // disable if row has id (editing mode)
          error: !!validationErrors?.language_id,
          helperText: validationErrors?.language_id,
        }),
      },
      {
        header: "Description",
        accessorKey: "description",
      },
    ];
    return (
      <>
        <DeleteConfirmationModal ref={DialogDeleteRef} />
        <CustomTable
          data={tempData}
          columns={column}
          renderRowActions={renderRowActions}
          onEditingRowSave={onEditingRowSave}
          renderTopToolbarCustomActions={renderTopToolbar}
          enableGlobalFilter={false}
          onCreatingRowSave={onCreatingRowSave}
        />
      </>
    );
  }
);
