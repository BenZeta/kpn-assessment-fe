import { Box, Chip, SxProps, Theme } from "@mui/material";
import {
  MaterialReactTable,
  MRT_ColumnDef,
  MRT_TableOptions,
  useMaterialReactTable,
} from "material-react-table";
import { ReactNode, useMemo } from "react";
import { TableSkeleton } from "./Skeleton";

export interface CustomTableColumn<T extends Record<string, any> = {}> extends MRT_ColumnDef<T> {
  renderCell?: (row: T) => ReactNode;
  renderChip?: (
    value: any,
    row: T
  ) => {
    label: string;
    color?: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning";
    variant?: "filled" | "outlined";
  };
  width?: string | number;
}

export interface CustomTableProps<T extends Record<string, any> = {}> {
  columns: CustomTableColumn<T>[];
  data: T[];
  isLoading?: boolean;
  showSkeleton?: boolean;
  skeletonRows?: number;
  skeletonColumns?: number;
  idAccessor?: keyof T | ((row: T) => string);
  enablePagination?: boolean;
  enableSorting?: boolean;
  enableFilters?: boolean;
  enableGlobalFilter?: boolean;
  enableColumnFilters?: boolean;
  enableRowSelection?: boolean;
  enableFullScreenToggle?: boolean;
  enableDensityToggle?: boolean;
  enableHiding?: boolean;
  stickyHeader?: boolean;
  searchPlaceholder?: string;
  defaultSortingField?: keyof T;
  defaultSortingDirection?: "asc" | "desc";
  tableContainerSx?: SxProps<Theme>;
  hasPermission?: boolean;
  emptyStateMessage?: string;
  tableHeight?: string | number;
  tableWidth?: string | number;
  onRowClick?: (row: T) => void;
  enableFacetedValues?: boolean;
}

const CustomTable = <T extends Record<string, any> = {}>({
  columns,
  data,
  isLoading = false,
  showSkeleton = true,
  skeletonRows = 2,
  skeletonColumns = 4,
  idAccessor = "id",
  enablePagination = true,
  enableSorting = true,
  enableFilters = true,
  enableGlobalFilter = true,
  enableColumnFilters = false,
  enableRowSelection = false,
  enableFullScreenToggle = false,
  enableDensityToggle = false,
  enableHiding = false,
  stickyHeader = true,
  searchPlaceholder = "Search...",
  defaultSortingField,
  defaultSortingDirection = "desc",
  tableContainerSx,
  hasPermission = true,
  emptyStateMessage = "No data available",
  tableHeight = "calc(100vh - 200px)",
  tableWidth = "100%",
  onRowClick,
  enableFacetedValues = false,
}: CustomTableProps<T>) => {
  // Transform our custom columns to MRT_ColumnDef columns
  const transformedColumns: MRT_ColumnDef<T>[] = useMemo(
    () =>
      columns.map(column => {
        const baseColumn: MRT_ColumnDef<T> = { ...column };

        // Remove custom properties that are not part of MRT_ColumnDef
        delete (baseColumn as any).renderCell;
        delete (baseColumn as any).renderChip;
        delete (baseColumn as any).width;

        // Add cell renderer based on renderCell or renderChip property
        if (column.renderCell || column.renderChip) {
          baseColumn.Cell = ({ row }) => {
            if (column.renderCell) {
              return column.renderCell(row.original);
            }
            if (column.renderChip && column.accessorKey) {
              const value = row.original[column.accessorKey as keyof T];
              const chipProps = column.renderChip(value, row.original);
              return (
                <Chip
                  label={chipProps.label}
                  color={chipProps.color || "default"}
                  variant={chipProps.variant || "outlined"}
                  size="small"
                  sx={{ minWidth: "90px" }}
                />
              );
            }
            return null;
          };
        }

        // Apply width if specified
        if (column.width) {
          baseColumn.size = typeof column.width === "number" ? column.width : undefined;
          baseColumn.muiTableHeadCellProps = {
            ...baseColumn.muiTableHeadCellProps,
            sx: {
              ...(typeof baseColumn.muiTableHeadCellProps === "object" &&
              baseColumn.muiTableHeadCellProps?.sx
                ? baseColumn.muiTableHeadCellProps.sx
                : {}),
              width: column.width,
            },
          };
        }

        return baseColumn;
      }),
    [columns]
  );

  // Configure the initial table state
  const initialState = useMemo(() => {
    const state: any = {
      showGlobalFilter: enableGlobalFilter,
      density: "comfortable",
      showColumnFilters: enableColumnFilters,
    };

    if (defaultSortingField) {
      state.sorting = [
        {
          id: defaultSortingField as string,
          desc: defaultSortingDirection === "desc",
        },
      ];
    }

    return state;
  }, [enableGlobalFilter, defaultSortingField, defaultSortingDirection]);

  // Configure the table options
  const tableOptions: MRT_TableOptions<T> = {
    columns: transformedColumns,
    data,
    getRowId: row => {
      if (typeof idAccessor === "function") {
        return idAccessor(row);
      }
      return String(row[idAccessor]);
    },
    positionGlobalFilter: "left",
    enablePagination,
    enableSorting,
    enableRowSelection,
    enableFullScreenToggle,
    enableDensityToggle,
    enableHiding,
    enableFilters,
    enableGlobalFilter,
    enableColumnFilters,
    globalFilterFn: "fuzzy",
    enableStickyHeader: stickyHeader,
    enableFilterMatchHighlighting: true,
    enableFacetedValues,
    muiTableContainerProps: {
      sx: {
        maxHeight: tableHeight,
        width: tableWidth,
        overflowY: "auto",
        "&::-webkit-scrollbar": {
          width: "8px",
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "#ccc",
          borderRadius: "4px",
        },
        "&::-webkit-scrollbar-track": {
          backgroundColor: "#f1f1f1",
        },
        "&::-webkit-scrollbar-thumb:hover": {
          backgroundColor: "#aaa",
          width: "8px",
        },
        ...tableContainerSx,
      },
    },
    muiTableHeadProps: {
      sx: {
        "& tr th": {
          position: "sticky",
          backgroundColor: theme => theme.palette.primary.main,
          color: "white",
        },
      },
    },
    muiTablePaperProps: {
      elevation: 0,
      sx: {
        borderRadius: "8px",
        border: "1px solid #e0e0e0",
        overflow: "hidden",
      },
    },
    muiTableProps: {
      sx: {
        tableLayout: "fixed",
        width: "100%",
      },
    },
    muiTableBodyRowProps: ({ row }) => ({
      sx: {
        backgroundColor: row.index % 2 === 0 ? "white" : "#f9f9f9",
        cursor: onRowClick ? "pointer" : "default",
      },
      onClick: onRowClick ? () => onRowClick(row.original) : undefined,
    }),

    initialState,
    muiSearchTextFieldProps: {
      variant: "outlined",
      size: "small",
      placeholder: searchPlaceholder,
      sx: {
        width: "300px",
        marginLeft: "auto",
        marginRight: "16px",
        marginBottom: "8px",
        "& .MuiOutlinedInput-root": {
          borderRadius: "8px",
          "& fieldset": {
            borderColor: "#e0e0e0",
          },
          "&.Mui-focused fieldset": {
            borderColor: theme => theme.palette.primary.main,
          },
        },
      },
    },
    muiTopToolbarProps: {
      sx: {
        backgroundColor: theme => theme.palette.background.paper,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      },
    },
  };

  const table = useMaterialReactTable(tableOptions);

  // Render loading state or empty state
  if (isLoading || !data || data.length === 0) {
    if (isLoading && showSkeleton) {
      return <TableSkeleton column={skeletonColumns} row={skeletonRows} small />;
    }

    if (!data || data.length === 0) {
      return (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>{emptyStateMessage}</Box>
      );
    }
  }

  return hasPermission ? <MaterialReactTable table={table} /> : null;
};

export default CustomTable;
