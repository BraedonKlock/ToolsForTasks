import { Routes, Route } from "react-router-dom";

import Header from "./components/header.jsx";
import Footer from "./components/footer.jsx";
import ScrollToTop from "./components/helpers/ScrollToTop.jsx";
import NotLoggedInHomePage from "./pages/notLoggedInHomePage.jsx";
import LoginPage from "./pages/loginPage.jsx";
import CreateAccountPage from "./pages/createAccountPage.jsx";
import LoggedInHomePage from "./pages/loggedInHomePage.jsx";
import JobsPage from "./pages/JobsPage.jsx";
import AddJobPage from "./pages/addJobPage";
import JobDetailsPage from "./pages/jobDetailsPage";
import EditJobPage from "./pages/editJobPage";
import ManageEmployeesPage from "./pages/manageEmployeesPage";
import AddEmployeesPage from "./pages/addEmployeesPage";
import EditEmployeePage from "./pages/editEmployeePage";
import ManageAccount from "./pages/manageAccountPage";
import ToolsPage from "./pages/toolsPage";

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Header />
      <Routes>
        <Route path="/" element={<NotLoggedInHomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/create-account" element={<CreateAccountPage />} />
        <Route path="/loggedIn" element={<LoggedInHomePage />} />
        <Route path="/loggedIn/jobs" element={<JobsPage />} />
        <Route path="/loggedIn/add-job" element={<AddJobPage />} />
        <Route path="/loggedIn/job-details/:id" element={<JobDetailsPage />} />
        <Route path="/loggedIn/edit-job/:id" element={<EditJobPage />} />
        <Route path="/loggedIn/manage-employees" element={<ManageEmployeesPage />} />
        <Route path="/loggedIn/add-employee" element={<AddEmployeesPage />} />
        <Route path="/loggedIn/edit-employee/:id" element={<EditEmployeePage />} />
        <Route path="/loggedIn/manage-account" element={<ManageAccount/>} />
        <Route path="/loggedIn/tools" element={<ToolsPage/>} />
      </Routes>
      <Footer />
    </>
  );
}
