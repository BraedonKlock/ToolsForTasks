import reactLogo from "./assets/react.svg";
import { Routes, Route } from "react-router-dom";

import "./styles/App.css";
import Header from "./components/header.jsx";
import LoginPage from "./pages/loginPage.jsx";
import LoggedInHomePage from "./pages/LoggedInHomePage.jsx";
import JobsPage from "./pages/JobsPage.jsx";

export default function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/loggedIn" element={<LoggedInHomePage />} />
        <Route path="/loggedIn/Jobs" element={<JobsPage />} />
      </Routes>
    </>
  );
}
