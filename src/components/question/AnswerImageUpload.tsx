import { Box, Button, IconButton } from "@mui/material";
import React, { ChangeEvent } from "react";
import { Control, Controller, useFieldArray } from "react-hook-form";
import { FaPlus } from "react-icons/fa6";
import { IoTrashOutline } from "react-icons/io5";
import PointField from "../forms/PointField";

type AnswerImageUploadProps = {
  selectedFiles: string[];
  setSelectedFiles: (value: string[]) => void;
  selectFileRef: React.RefObject<HTMLInputElement>;
  onSelectImage: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  maxFiles: number;
  control: Control<any>;
  name: string;
  rules?: any;
  passFile?: (file: File) => void;
};

const AnswerImageUpload: React.FC<AnswerImageUploadProps> = ({
  selectedFiles,
  setSelectedFiles,
  selectFileRef,
  onSelectImage,
  disabled,
  maxFiles,
  control,
  name,
  rules,
  passFile,
}) => {
  const handleDelete = (index: number) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);
  };
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <Box sx={{ display: "flex", direction: "row", wrap: "wrap", gap: 2 }}>
          {selectedFiles.map((file, index) => (
            <Box
              key={index}
              sx={{
                border: "1px solid",
                borderRadius: "8px",
                justifyItems: "center",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  position: "relative",
                  alignItems: "center",
                  borderRadius: "8px",
                }}
              >
                <img
                  src={file}
                  style={{
                    borderRadius: "8px",
                    objectFit: "contain",
                    height: "140px",
                    width: "130px",
                  }}
                />
                <IconButton
                  children={<IoTrashOutline />}
                  onClick={() => handleDelete(index)}
                  sx={{ position: "absolute", top: 0, right: 0, color: "red" }}
                  size="small"
                />
              </Box>
              <PointField
                name={`answers.${index}.point`}
                control={control}
                disabled={disabled}
              />
            </Box>
          ))}
          {selectedFiles.length < maxFiles && (
            <Box
              sx={{
                justifyContent: "center",
                alignContent: "center",
                padding: "12px 8px",
                border: "1px dashed",
                cursor: "pointer",
                borderRadius: "8px",
                height: "140px",
                width: "130px",
                borderColor: "grey.500",
              }}
              onClick={() => selectFileRef.current?.click()}
            >
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                ref={selectFileRef}
                // onChange={onSelectImage}
                onChange={(e: ChangeEvent<HTMLInputElement> | null) => {
                  if (!e || !e.target.files) return;
                  onChange(e.target.files[0]);
                  passFile && passFile(e.target.files[0]);
                  console.log('this is file',e.target.files[0]);
                  onSelectImage(e);
                }}
                style={{ display: "none" }}
                multiple
                disabled={disabled}
              />
              <Button
                variant="text"
                startIcon={<FaPlus />}
                color="primary"
                sx={{ textTransform: "none" }}
              >
                Add Image
              </Button>
            </Box>
          )}
        </Box>
      )}
    />
  );
};
export default AnswerImageUpload;
