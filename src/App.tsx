import { CssBaseline, ThemeProvider } from "@mui/material";
import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import theme from "./theme";
import { Refine } from "@refinedev/core";
import dataProvider from "@refinedev/simple-rest";
import { ErrorBoundary } from "react-error-boundary";
import AdminLayout from "./components/AdminLayout";
import { ErrorFallback } from "./error/ErrorFallback";
import LoadingSuspense from "./loader/Loading";
import Admin from "./pages/Admin";
import AdminAccounts from "./pages/AdminAccounts";
import AdminDetails from "./pages/AdminDetails";
import AdminLogin from "./pages/AdminLogin";
import CreateAdmin from "./pages/CreateAdmin";
import CreateEditRole from "./pages/CreateEditRole";
import Landing from "./pages/Landing";
import BusinessUnit from "./pages/master-data/BusinessUnit";
import Criteria from "./pages/master-data/Criteria";
import FunctionMenu from "./pages/master-data/FunctionMenu";
import CreateEditQuestion from "./pages/master-data/question/CreateEditQuestion";
import Question from "./pages/master-data/question/Question";
import QuestionDetails from "./pages/master-data/question/QuestionDetails";
import Series from "./pages/master-data/Series";
import ShortBrief from "./pages/master-data/ShortBrief";
import TermsPP from "./pages/master-data/TermsPP";
import ReqResetPass from "./pages/ReqResetPass";
import ResetPass from "./pages/ResetPass";
import RoleManager from "./pages/RoleManager";
import { LoadingProvider } from "./providers/LoadingProvider";
import { SnackbarProvider } from "./providers/SnackbarProvider";
import CreateSeries from "./pages/master-data/CreateSeries";
import {Category} from "@/pages/master-data/Category.tsx";
import {GroupTest} from "@/pages/master-data/group-test/GroupTest.tsx";
import GroupTestCreateEdit from "@/pages/master-data/group-test/GroupTestCreateEdit.tsx";
import SubTest from "@/pages/master-data/sub-test/SubTest.tsx";
import {Test} from "@/pages/master-data/test/Test.tsx";
import TestCreateEdit from "@/pages/master-data/test/TestCreateEdit.tsx";
import SubTestCreateEdit from "@/pages/master-data/sub-test/SubTestCreateEdit.tsx";
import SeriesDetails from "@/pages/master-data/SeriesDetails.tsx";
import {Batch} from "@/pages/master-data/batch/Batch.tsx";
import BatchCreateEdit from "@/pages/master-data/batch/BatchCreateEdit.tsx";
import {EmailTemplate} from "@/pages/master-data/EmailTemplate.tsx";

const WelcomeClient = lazy(() => import("@/pages/WelcomeClient"));
const RouteProtector = lazy(() => import("@/protector/RouteProtector"));

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
    path: "/client",
    element: <RouteProtector />,
    children: [{ path: "", element: <WelcomeClient /> }],
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
        path: "series/:id",
        element: <SeriesDetails/>
      },
      {
        path: "series/create",
        element: <CreateSeries />,
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
        element: <SubTest/>
      },
      {
        path: "subtest/create",
        element: <SubTestCreateEdit/>
      },
      {
        path: "subtest/edit/:id",
        element: <SubTestCreateEdit/>
      },
      {
        path: "test",
        element: <Test/>
      },
      {
        path: "test/create",
        element: <TestCreateEdit/>
      },
      {
        path: "test/edit/:id",
        element: <TestCreateEdit/>
      },
      {
        path: "grouptest",
        element: <GroupTest/>
      },
      {
        path: "grouptest/create",
        element: <GroupTestCreateEdit/>
      },
      {
        path: "grouptest/edit/:id",
        element: <GroupTestCreateEdit/>
      },
      {
        path: "batch",
        element: <Batch/>
      },
      {
        path: "email-template",
        element: <EmailTemplate/>
      }
      // {
      //   path: "batch/create",
      //   element: <BatchCreateEdit/>
      // }
    ],
  },
]);

function App() {
  return (
    <>
      <ThemeProvider theme={theme}>
        <SnackbarProvider>
          <LoadingProvider>
            <ErrorBoundary fallback={<ErrorFallback />}>
              <Suspense fallback={<LoadingSuspense />}>
                <CssBaseline />
                <Refine
                  dataProvider={dataProvider("https://localhost:5001/")}
                  // notificationProvider={useNotificationProvider()}
                  resources={refineResources}
                >
                  <RouterProvider router={router} />
                </Refine>
              </Suspense>
            </ErrorBoundary>
          </LoadingProvider>
        </SnackbarProvider>
      </ThemeProvider>
    </>
  );
}

export default App;
