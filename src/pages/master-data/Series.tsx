import DialogComp from "@/components/Dialog";
import CheckboxCtrl from "@/components/forms/Checkbox";
import TextFieldCtrl from "@/components/forms/TextField";
import useAPI from "@/hooks/useAPI";
import useAuthStore from "@/hooks/useAuthStore";
import useDialog from "@/hooks/useDialog";
import {
  alpha,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Paper,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import React from "react";
import { useForm } from "react-hook-form";
import { IoIosSearch } from "react-icons/io";
import { IoFilter } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const Series = () => {
  const API = useAPI();
  const user_id = useAuthStore((state) => state.user_id);
  const navigate = useNavigate()

  const { isOpen: isOpenForm, open: openForm, close: closeForm } = useDialog();
  const handleCloseForm = () => {
    reset();
    closeForm();
  };

  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm({
    defaultValues: {
      series_name: "",
      created_by: user_id,
      is_active: false,
    },
  });

  interface Data {
    id: number;
    name: string;
    series_code: string;
    question_count: number;
    created_by: string;
    created_at: string;
    is_active: boolean;
  }

  function createData(
    id: number,
    name: string,
    series_code: string,
    question_count: number,
    created_by: string,
    created_at: string,
    is_active: boolean
  ): Data {
    return {
      id,
      name,
      series_code,
      question_count,
      created_by,
      created_at,
      is_active,
    };
  }

  const rows = [
    createData(1, "Matematika", "MAT101", 20, "admin", "10 Jan 2020", true),
    createData(2, "Fisika", "FIS102", 15, "admin", "12 Feb 2020", true),
    createData(3, "Kimia", "KIM103", 18, "admin", "15 Mar 2020", false),
    createData(4, "Biologi", "BIO104", 22, "admin", "20 Apr 2020", true),
    createData(5, "Sejarah", "SEJ105", 10, "admin", "25 May 2020", true),
    createData(6, "Geografi", "GEO106", 12, "admin", "30 Jun 2020", false),
    createData(7, "Sosiologi", "SOS107", 14, "admin", "05 Jul 2020", true),
    createData(8, "Ekonomi", "EKO108", 16, "admin", "10 Aug 2020", true),
    createData(
      9,
      "Bahasa Indonesia",
      "IND109",
      20,
      "admin",
      "15 Sep 2020",
      false
    ),
    createData(
      10,
      "Bahasa Inggris",
      "ENG110",
      25,
      "admin",
      "20 Oct 2020",
      true
    ),
    createData(
      11,
      "Matematika Lanjutan",
      "MAT201",
      30,
      "admin",
      "25 Nov 2020",
      true
    ),
    createData(
      12,
      "Fisika Lanjutan",
      "FIS202",
      28,
      "admin",
      "30 Dec 2020",
      false
    ),
    createData(
      13,
      "Kimia Lanjutan",
      "KIM203",
      26,
      "admin",
      "05 Jan 2021",
      true
    ),
    createData(
      14,
      "Biologi Lanjutan",
      "BIO204",
      24,
      "admin",
      "10 Feb 2021",
      true
    ),
    createData(
      15,
      "Sejarah Lanjutan",
      "SEJ205",
      22,
      "admin",
      "15 Mar 2021",
      false
    ),
    createData(
      16,
      "Geografi Lanjutan",
      "GEO206",
      20,
      "admin",
      "20 Apr 2021",
      true
    ),
  ];

  function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  }

  type Order = "asc" | "desc";

  function getComparator<Key extends keyof any>(
    order: Order,
    orderBy: Key
  ): (
    a: { [key in Key]: number | string | boolean },
    b: { [key in Key]: number | string | boolean }
  ) => number {
    return order === "desc"
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  }

  interface HeadCell {
    disablePadding: boolean;
    id: keyof Data;
    label: string;
    numeric: boolean;
  }

  const headCells: readonly HeadCell[] = [
    {
      id: "name",
      numeric: false,
      disablePadding: true,
      label: "Name",
    },
    {
      id: "series_code",
      numeric: false,
      disablePadding: false,
      label: "Code",
    },
    {
      id: "question_count",
      numeric: true,
      disablePadding: false,
      label: "Total Questions",
    },
    {
      id: "created_by",
      numeric: false,
      disablePadding: false,
      label: "Created By",
    },
    {
      id: "created_at",
      numeric: false,
      disablePadding: false,
      label: "Created At",
    },
    {
      id: "is_active",
      numeric: false,
      disablePadding: false,
      label: "Active",
    },
  ];

  interface EnhancedTableProps {
    numSelected: number;
    onRequestSort: (
      event: React.MouseEvent<unknown>,
      property: keyof Data
    ) => void;
    onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
    order: Order;
    orderBy: string;
    rowCount: number;
  }

  function EnhancedTableHead(props: EnhancedTableProps) {
    const {
      onSelectAllClick,
      order,
      orderBy,
      numSelected,
      rowCount,
      onRequestSort,
    } = props;
    const createSortHandler =
      (property: keyof Data) => (event: React.MouseEvent<unknown>) => {
        onRequestSort(event, property);
      };

    return (
      <TableHead>
        <TableRow>
          <TableCell padding="checkbox">
            <Checkbox
              color="primary"
              indeterminate={numSelected > 0 && numSelected < rowCount}
              checked={rowCount > 0 && numSelected === rowCount}
              onChange={onSelectAllClick}
              inputProps={{
                "aria-label": "select all desserts",
              }}
            />
          </TableCell>
          {headCells.map((headCell) => (
            <TableCell
              key={headCell.id}
              align={headCell.numeric ? "right" : "left"}
              padding={headCell.disablePadding ? "none" : "normal"}
              sortDirection={orderBy === headCell.id ? order : false}
            >
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : "asc"}
                onClick={createSortHandler(headCell.id)}
              >
                {headCell.label}
                {orderBy === headCell.id ? (
                  <Box component="span" sx={visuallyHidden}>
                    {order === "desc"
                      ? "sorted descending"
                      : "sorted ascending"}
                  </Box>
                ) : null}
              </TableSortLabel>
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
    );
  }
  interface EnhancedTableToolbarProps {
    numSelected: number;
  }
  function EnhancedTableToolbar(props: EnhancedTableToolbarProps) {
    const { numSelected } = props;
    return (
      <Toolbar
        sx={[
          {
            pl: { sm: 2 },
            pr: { xs: 1, sm: 1 },
          },
          numSelected > 0 && {
            bgcolor: (theme) =>
              alpha(
                theme.palette.primary.main,
                theme.palette.action.activatedOpacity
              ),
          },
        ]}
      >
        {numSelected > 0 ? (
          <Typography
            sx={{ flex: "1 1 100%" }}
            color="inherit"
            variant="subtitle1"
            component="div"
          >
            {numSelected} selected
          </Typography>
        ) : (
          <Typography
            sx={{ flex: "1 1 100%" }}
            variant="h6"
            id="tableTitle"
            component="div"
          >
            Series
          </Typography>
        )}
        {numSelected > 0 ? (
          <Tooltip title="Delete">
            <IconButton>
              <MdDelete />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title="Filter list">
            <IconButton>
              <IoFilter />
            </IconButton>
          </Tooltip>
        )}
      </Toolbar>
    );
  }
  const [order, setOrder] = React.useState<Order>("asc");
  const [orderBy, setOrderBy] = React.useState<keyof Data>("question_count");
  const [selected, setSelected] = React.useState<readonly number[]>([]);
  const [page, setPage] = React.useState(0);
  const [dense, setDense] = React.useState(false);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const handleRequestSort = (
    _: React.MouseEvent<unknown>,
    property: keyof Data
  ) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = rows.map((n) => n.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (_: React.MouseEvent<unknown>, id: number) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: readonly number[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangeDense = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDense(event.target.checked);
  };

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  const visibleRows = React.useMemo(
    () =>
      [...rows]
        .sort(getComparator(order, orderBy))
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [order, orderBy, page, rowsPerPage]
  );

  return (
    <>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h1" color="primary">
          Series
        </Typography>
        <Button
          variant="contained"
          sx={{ fontWeight: "600" }}
          onClick={() => navigate('/admin/series/create')}
        >
          Create Series
        </Button>
      </Box>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <TextField
          variant="outlined"
          placeholder="Search..."
          sx={{
            backgroundColor: "white",
            borderRadius: "12px",
            border: "none",
            height: "40px",
          }}
          InputProps={{
            type: "search",
            sx: { borderRadius: "12px", height: "40px" },
            startAdornment: (
              <InputAdornment position="start">
                {" "}
                <IconButton edge="start">{<IoIosSearch />}</IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Box sx={{ width: "100%", mt: 2 }}>
        <Paper sx={{ width: "100%", mb: 2 }}>
          <EnhancedTableToolbar numSelected={selected.length} />
          <TableContainer>
            <Table
              sx={{ minWidth: 750 }}
              aria-labelledby="tableTitle"
              size={dense ? "small" : "medium"}
            >
              <EnhancedTableHead
                numSelected={selected.length}
                order={order}
                orderBy={orderBy}
                onSelectAllClick={handleSelectAllClick}
                onRequestSort={handleRequestSort}
                rowCount={rows.length}
              />
              <TableBody>
                {visibleRows.map((row, index) => {
                  const isItemSelected = selected.includes(row.id);
                  const labelId = `enhanced-table-checkbox-${index}`;

                  return (
                    <TableRow
                      hover
                      onClick={(event) => handleClick(event, row.id)}
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={row.id}
                      selected={isItemSelected}
                      sx={{ cursor: "pointer" }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="primary"
                          checked={isItemSelected}
                          inputProps={{
                            "aria-labelledby": labelId,
                          }}
                        />
                      </TableCell>
                      <TableCell
                        component="th"
                        id={labelId}
                        scope="row"
                        padding="none"
                      >
                        {row.name}
                      </TableCell>
                      <TableCell align="right">{row.series_code}</TableCell>
                      <TableCell align="right">{row.question_count}</TableCell>
                      <TableCell align="right">{row.created_by}</TableCell>
                      <TableCell align="right">{row.created_at}</TableCell>
                      <TableCell align="right">{row.is_active}</TableCell>
                    </TableRow>
                  );
                })}
                {emptyRows > 0 && (
                  <TableRow
                    style={{
                      height: (dense ? 33 : 53) * emptyRows,
                    }}
                  >
                    <TableCell colSpan={6} />
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={rows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
        <FormControlLabel
          control={<Switch checked={dense} onChange={handleChangeDense} />}
          label="Dense padding"
        />
      </Box>
      <DialogComp
        title="Create a New Series"
        open={isOpenForm}
        onClose={handleCloseForm}
        actions={
          <>
            <Button onClick={handleCloseForm} variant="outlined">
              Cancel
            </Button>
            <Button onClick={() => {}} variant="contained" disabled={!isDirty}>
              Create
            </Button>
          </>
        }
      >
        <TextFieldCtrl
          control={control}
          label="Series Name"
          name="series_name"
          rules={{ required: "Field required" }}
        />
        <TextFieldCtrl
          control={control}
          label="Series Code"
          name="series_code"
          rules={{ required: "Field required" }}
        />
        <CheckboxCtrl name="is_active" control={control} label="Active" />
      </DialogComp>
    </>
  );
};
export default Series;
