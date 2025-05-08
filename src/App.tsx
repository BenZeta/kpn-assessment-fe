import ProctoringCheckSession from "@/pages/client/ProctoringCheckSession";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Refine } from "@refinedev/core";
import dataProvider from "@refinedev/simple-rest";
import { lazy, Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ErrorFallback } from "./error/ErrorFallback";
import LoadingSuspense from "./loader/Loading";
import QuestionAnswer from "./pages/client/QuestionAnswer";
import { LoadingProvider } from "./providers/LoadingProvider";
import { SnackbarProvider } from "./providers/SnackbarProvider";
import theme from "./theme";
import RootClient from "./pages/client/RootClient";
const BatchesDashboard = lazy(() => import("./pages/client/BatchesDashboard"));
const VerifyDarwinToken = lazy(() => import("./pages/client/VerifyDarwinToken"));
const TermsPPPage = lazy(() => import("./pages/client/TermsPPPage"));
import QuestionAnswerExample from "./pages/client/QuestionAnswerExample";
import ExternalLogin from "./pages/client/ExternalLogin";
import RedirectPage from "./pages/client/RedirectPage";
const SubtestTemp = lazy(() => import("./pages/master-data/sub-test/SubtestTemp"));

const SubTestClient = lazy(() => import("./pages/client/SubtestClient"));
const AdminLayout = lazy(() => import("./components/AdminLayout"));
const Admin = lazy(() => import("@/pages/Admin"));
const WelcomeClient = lazy(() => import("@/pages/client/WelcomeClient"));
const AdminAccounts = lazy(() => import("./pages/AdminAccounts"));
const AdminDetails = lazy(() => import("./pages/AdminDetails"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const CreateAdmin = lazy(() => import("./pages/CreateAdmin"));
const CreateEditRole = lazy(() => import("./pages/CreateEditRole"));
const Landing = lazy(() => import("./pages/Landing"));
const Batch = lazy(() => import("./pages/master-data/batch/Batch"));
const BatchCreateEdit = lazy(() => import("./pages/master-data/batch/BatchCreateEdit"));
const BusinessUnit = lazy(() => import("./pages/master-data/BusinessUnit"));
const Criteria = lazy(() => import("./pages/master-data/Criteria"));
const FunctionMenu = lazy(() => import("./pages/master-data/FunctionMenu"));
const GroupTest = lazy(() => import("./pages/master-data/group-test/GroupTest"));
const CreateEditQuestion = lazy(() => import("./pages/master-data/question/CreateEditQuestion"));
const Question = lazy(() => import("./pages/master-data/question/Question"));
const QuestionDetails = lazy(() => import("./pages/master-data/question/QuestionDetails"));
const CreateSeries = lazy(() => import("./pages/master-data/series/CreateSeries"));
const Series = lazy(() => import("./pages/master-data/series/Series"));
const ShortBrief = lazy(() => import("./pages/master-data/ShortBrief"));
const SubTest = lazy(() => import("./pages/master-data/sub-test/SubTest"));
const TermsPP = lazy(() => import("./pages/master-data/TermsPP"));
const ReqResetPass = lazy(() => import("./pages/ReqResetPass"));
const ResetPass = lazy(() => import("./pages/ResetPass"));
const RoleManager = lazy(() => import("./pages/RoleManager"));
const Category = lazy(() => import("@/pages/master-data/Category.tsx"));
const EmailTemplate = lazy(() => import("@/pages/master-data/EmailTemplate.tsx"));
const GroupTestCreateEdit = lazy(
  () => import("@/pages/master-data/group-test/GroupTestCreateEdit.tsx")
);
const GroupTestDetail = lazy(() => import("@/pages/master-data/group-test/GroupTestDetail.tsx"));
const SeriesDetails = lazy(() => import("@/pages/master-data/series/SeriesDetails"));
const SubTestCreateEdit = lazy(() => import("@/pages/master-data/sub-test/SubTestCreateEdit.tsx"));
const SubTestDetail = lazy(() => import("@/pages/master-data/sub-test/SubTestDetail.tsx"));
const Test = lazy(() => import("@/pages/master-data/test/Test.tsx"));
const TestCreateEdit = lazy(() => import("@/pages/master-data/test/TestCreateEdit.tsx"));
const TestDetail = lazy(() => import("@/pages/master-data/test/TestDetail.tsx"));
const MockQnaClient = lazy(() => import("@/pages/client/QuestionAnswerDummy"));

const refineResources = [
  {
    name: "admin",
    list: () => <Admin />,
  },
  {
    name: "business-units",
    list: () => <BusinessUnit />,
  },
  {
    name: "terms-pp",
    list: () => <TermsPP />,
  },
  {
    name: "short-briefs",
    list: () => <ShortBrief />,
  },
];

const router = createBrowserRouter([
  {
    path: "/",
    element: <Landing />,
  },
  {
    path: "login/client",
    element: <ExternalLogin />,
  },
  {
    path: "login/client/:token",
    element: <ExternalLogin />,
  },
  {
    path: "redirect/:token",
    element: <RedirectPage />,
  },
  {
    path: "client",
    element: <VerifyDarwinToken />,
    children: [
      {
        path: "dashboard",
        element: <BatchesDashboard />,
      },
      {
        path: ":token",
        element: <WelcomeClient />,
        // children: [{ path: "", element: <WelcomeClient /> }],
      },
      {
        path: "assessment/:token/subtest/:id/termspp",
        element: <TermsPPPage />,
      },
      {
        path: "assessment/:token/subtest/:id/proctor",
        element: <ProctoringCheckSession />,
      },
      {
        path: "assessment/:token/test/:id",
        element: <SubTestClient />,
      },
      {
        path: "assessment/:token/example/subtest/:id",
        element: <QuestionAnswerExample />,
      },
      {
        path: "assessment/:token/subtest/:id",
        element: <QuestionAnswer />,
      },
    ],
  },
  {
    path: "/admin-login",
    element: <AdminLogin />,
  },
  {
    path: "/reset-pass",
    element: <ReqResetPass />,
  },
  {
    path: "/reset-pass/:email",
    element: <ResetPass />,
  },
  {
    path: "admin",
    element: <AdminLayout />,
    children: [
      {
        path: "",
        element: <Admin />,
      },
      {
        path: "bu",
        element: <BusinessUnit />,
      },
      {
        path: "terms-pp",
        element: <TermsPP />,
      },
      {
        path: "short-brief",
        element: <ShortBrief />,
      },
      {
        path: "series",
        element: <Series />,
      },
      {
        path: "series/create",
        element: <CreateSeries />,
      },
      {
        path: "series/create/:id",
        element: <CreateSeries />,
      },
      {
        path: "series/:id",
        element: <SeriesDetails />,
      },
      {
        path: "criteria",
        element: <Criteria />,
      },
      {
        path: "function-menu",
        element: <FunctionMenu />,
      },
      {
        path: "question",
        element: <Question />,
      },
      {
        path: "question/:id",
        element: <QuestionDetails />,
      },
      {
        path: "question/create",
        element: <CreateEditQuestion />,
      },
      {
        path: "question/edit/:id",
        element: <CreateEditQuestion />,
      },
      {
        path: "accounts",
        element: <AdminAccounts />,
      },
      {
        path: "accounts/:id",
        element: <AdminDetails />,
      },
      {
        path: "accounts/create",
        element: <CreateAdmin />,
      },
      {
        path: "role",
        element: <RoleManager />,
      },
      {
        path: "role/create",
        element: <CreateEditRole />,
      },
      {
        path: "role/edit/:id",
        element: <CreateEditRole />,
      },
      {
        path: "category",
        element: <Category />,
      },
      {
        path: "subtest",
        element: <SubTest />,
      },
      {
        path: "subtest/create",
        // element: <SubTestCreateEdit />,
        element: <SubtestTemp />,
      },
      {
        path: "subtest/edit/:id",
        // element: <SubTestCreateEdit />,
        element: <SubtestTemp />,
      },
      {
        path: "subtest/detail/:id",
        element: <SubTestDetail />,
      },
      {
        path: "test",
        element: <Test />,
      },
      {
        path: "test/create",
        element: <TestCreateEdit />,
      },
      {
        path: "test/edit/:id",
        element: <TestCreateEdit />,
      },
      {
        path: "test/detail/:id",
        element: <TestDetail />,
      },
      {
        path: "grouptest",
        element: <GroupTest />,
      },
      {
        path: "grouptest/create",
        element: <GroupTestCreateEdit />,
      },
      {
        path: "grouptest/edit/:id",
        element: <GroupTestCreateEdit />,
      },
      {
        path: "grouptest/detail/:id",
        element: <GroupTestDetail />,
      },
      {
        path: "email-template",
        element: <EmailTemplate />,
      },
      {
        path: "batch",
        element: <Batch />,
      },
      {
        path: "batch/create",
        element: <BatchCreateEdit />,
      },
      {
        path: "batch/edit/:id",
        element: <BatchCreateEdit />,
      },
    ],
  },
]);

const API_URL = "https://localhost:5000/api";

function App() {
  return (
    <>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <SnackbarProvider>
            <LoadingProvider>
              <ErrorBoundary fallback={<ErrorFallback />}>
                <Suspense fallback={<LoadingSuspense />}>
                  <CssBaseline />
                  <Refine
                    dataProvider={dataProvider(API_URL)}
                    // notificationProvider={useNotificationProvider()}
                    resources={refineResources}
                  >
                    <RouterProvider router={router} />
                  </Refine>
                </Suspense>
              </ErrorBoundary>
            </LoadingProvider>
          </SnackbarProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </>
  );
}

export default App;
