import { Routes, Route } from "react-router-dom";

import Header from "./components/header.jsx";
import Footer from "./components/footer.jsx";
import ScrollToTop from "./components/helpers/ScrollToTop.jsx";

import NotLoggedInHomePage from "./pages/notLoggedInHomePage.jsx";
import LoginPage from "./pages/loginPage.jsx";
import CreateAccountPage from "./pages/createAccountPage.jsx";
import ForgetPasswordPage from "./pages/forgetPasswordPage.jsx";

import LoggedInHomePage from "./pages/loggedInHomePage.jsx";
import JobsPage from "./pages/JobsPage.jsx";
import AddJobPage from "./pages/addJobPage";
import JobDetailsPage from "./pages/jobDetailsPage";
import EditJobPage from "./pages/editJobPage";
import AddToolKitPage from "./pages/addToolKitPage.jsx"
import EditToolKitPage from "./pages/editToolKitPage.jsx"

import ManageEmployeesPage from "./pages/manageEmployeesPage";
import AddEmployeesPage from "./pages/addEmployeesPage";
import EditEmployeePage from "./pages/editEmployeePage";

import ManageAccount from "./pages/manageAccountPage";
import ToolsPage from "./pages/toolsPage";
import AddToolPage from "./pages/addToolPage.jsx";
import EditToolPage from "./pages/editToolPage.jsx";

import RequireRole from "./routes/RequireRole.jsx";

import ForbiddenPage from "./pages/forbiddenPage.jsx";

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Header />

      <Routes>
        {/* Public routes */}
        <Route path="/" element={<NotLoggedInHomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forget-password" element={<ForgetPasswordPage />} />
        <Route path="/create-account" element={<CreateAccountPage />} />
        <Route path="/forbidden" element={<ForbiddenPage />} />

        {/* Logged-in routes (ALL ROLES) */}
        <Route element={<RequireRole allowed={["owner", "manager", "crew"]} />}>
          <Route path="/loggedIn" element={<LoggedInHomePage />} />
          <Route path="/loggedIn/job-details/:id" element={<JobDetailsPage />} />
        </Route>

        {/* Manager + Owner routes */}
        <Route element={<RequireRole allowed={["owner", "manager"]} />}>
          <Route path="/loggedIn/jobs" element={<JobsPage />} />
          <Route path="/loggedIn/add-job" element={<AddJobPage />} />
          <Route path="/loggedIn/edit-job/:id" element={<EditJobPage />} />
          <Route path="/loggedIn/tools" element={<ToolsPage />} />
          <Route path="/loggedIn/add-tool" element={<AddToolPage />} />
          <Route path="/loggedIn/edit-tool/:id" element={<EditToolPage />} />
          <Route path="/loggedIn/add-tool-kit" element={<AddToolKitPage />} />
          <Route path="/loggedIn/edit-tool-kit" element={< EditToolKitPage/> } />

        </Route>

        {/* Owner-only routes */}
        <Route element={<RequireRole allowed={["owner"]} />}>
          <Route path="/loggedIn/manage-employees" element={<ManageEmployeesPage />} />
          <Route path="/loggedIn/add-employee" element={<AddEmployeesPage />} />
          <Route path="/loggedIn/edit-employee/:id" element={<EditEmployeePage />} />
          <Route path="/loggedIn/manage-account" element={<ManageAccount />} />
        </Route>
      </Routes>

      <Footer />
    </>
  );
}
