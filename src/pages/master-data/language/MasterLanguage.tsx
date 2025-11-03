import CustomTable, { CustomTableColumn } from "@/components/CustomTable";
import { LanguageMaster } from "@/types/MasterData";
import { useLoading } from "@/providers/LoadingProvider";
import useAPI from "@/hooks/useAPI";
import CheckboxComponent from "@/components/common/CheckboxComponent";
import useFetch from "@/hooks/useFetch";
import { useMemo } from "react";

export default function MasterLanguage() {
  const api = useAPI();
  const { data, loading, error } = useFetch<{ data: LanguageMaster[] }>(`/languages/master`);
  const rows = useMemo(() => data?.data, [data]);
  const { showLoading, hideLoading } = useLoading();
  const changeIsActive = async (id: string, value: boolean) => {
    try {
      showLoading();
      await api.post("/languages", {
        id: id,
        payload: {
          is_active: value,
        },
      });
    } catch (error) {
      throw error;
    } finally {
      hideLoading();
    }
  };
  const changeIsDisplayed = async (id: string, value: boolean) => {
    try {
      showLoading();
      await api.post("/languages", {
        id: id,
        payload: {
          is_display_client: value,
        },
      });
    } catch (error) {
      throw error;
    } finally {
      hideLoading();
    }
  };
  const Column: CustomTableColumn<LanguageMaster>[] = [
    {
      header: "Language Name",
      accessorKey: "language_name",
      Cell: ({ row }) => {
        return `${row.original.language_name} (${row.original.language_code})`;
      },
    },
    {
      header: "Native Name",
      accessorKey: "language_name_native",
    },
    {
      header: "Active",
      accessorKey: "is_active",
      Cell: ({ row }) => {
        const data = row.original;
        return <CheckboxComponent id={data.id} onClick={changeIsActive} value={data.is_active} />;
      },
    },
    {
      header: "Display Client",
      accessorKey: "is_display_client",
      Cell: ({ row }) => {
        const data = row.original;
        return (
          <CheckboxComponent
            id={data.id}
            onClick={changeIsDisplayed}
            value={data.is_display_client}
          />
        );
      },
    },
  ];
  return <CustomTable data={rows ?? []} columns={Column} />;
}
