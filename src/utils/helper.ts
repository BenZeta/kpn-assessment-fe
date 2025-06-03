import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";

export const formatDateTime = (isoString: string) => {
  const date = parseISO(isoString);
  return format(date, "HH:mm, eeee dd MMMM yyyy", { locale: id });
};

export const formatPeriod = (start: string, end: string) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  return `${format(startDate, "dd MMM yyyy")} - ${format(endDate, "dd MMM yyyy")}`;
};

export const truncateText = (value: string, limit: number) => {
  if (value.length <= limit) {
    return value;
  }
  return `${value.substring(0, limit)}...`;
};
