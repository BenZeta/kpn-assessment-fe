import { HelpOutlineOutlined } from "@mui/icons-material";
import { lazy, useMemo, Suspense } from "react";

const importLazy = (icon: string) => {
  switch (icon) {
    case "Menu":
      return lazy(() => import("@mui/icons-material/Menu"));
    case "Business":
      return lazy(() => import("@mui/icons-material/Business"));
    case "Policy":
      return lazy(() => import("@mui/icons-material/Policy"));
    case "Subject":
      return lazy(() => import("@mui/icons-material/Subject"));
    case "SportsScore":
      return lazy(() => import("@mui/icons-material/SportsScore"));
    case "QuestionAnswer":
      return lazy(() => import("@mui/icons-material/QuestionAnswer"));
    case "FormatListNumbered":
      return lazy(() => import("@mui/icons-material/FormatListNumbered"));
    case "List":
      return lazy(() => import("@mui/icons-material/List"));
    default:
      return HelpOutlineOutlined;
  }
};

export default function IconRenderer({ icon }: { icon: string }) {
  const Icon = useMemo(() => importLazy(icon), [icon]);

  return (
    <Suspense fallback={<HelpOutlineOutlined />}>
      <Icon />
    </Suspense>
  );
}
