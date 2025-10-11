import reactLogo from "./assets/react.svg";
import { Routes, Route } from "react-router-dom";

import "./styles/App.css";
import Header from "./components/header.jsx";
import LoginPage from "./pages/loginPage.jsx"

export default function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
      </Routes>

    </>
  );
}
