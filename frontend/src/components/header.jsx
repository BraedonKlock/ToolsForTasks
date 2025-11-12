import { useState, useContext, useEffect, useRef } from "react";
import { NavLink, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../styles/header.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";

export default function Header() {
  const { user, isLoggedIn, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  const [companyName, setCompanyName] = useState(user?.companyName ?? "");
  const [role, setRole] = useState(user?.role ?? null);
  const [employeeName, setEmployeeName] = useState(user?.name ?? "");

  useEffect(() => {
    if (user) {
      setCompanyName(user.companyName ?? "");
      setRole(user.role ?? null);
      setEmployeeName(user.name ?? "");
    }

    function handleClickOutside(e) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("pointerdown", handleClickOutside, true);
    return () =>
          document.removeEventListener("pointerdown", handleClickOutside, true);

  }, [user]);

    useEffect(() => {
    function handleClickOutside(e) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("pointerdown", handleClickOutside, true);
    return () =>
          document.removeEventListener("pointerdown", handleClickOutside, true);

  }, []);

  const showNotLoggedIn = !isLoggedIn;
  const showCrew = isLoggedIn && role === "crew";
  const showManager = isLoggedIn && role === "manager";
  const showOwner = isLoggedIn && role === "owner";

  return (
    <header ref={menuRef} className="mobile">
      <nav>
        <button className="hamburger" id="hamburger" onClick={() => setIsOpen(o=>!o)}><FontAwesomeIcon icon={faBars} size="lg" className="menu-image" /></button>

        {showNotLoggedIn && (
          <div id="logoContainer">
            <Link to="/" onClick={() => setIsOpen(false)}>
              <img id="logo" src="/images/lg.png" alt="Tools for Tasks logo" />
            </Link>
          </div>
        )}

        {(showCrew || showManager || showOwner) && (
          <>
            <div id="logoContainer">
              <Link to="/loggedIn" onClick={() => setIsOpen(false)}>
                <img id="logo" src="/images/lg.png" alt="Tools for Tasks logo" />
              </Link>
            </div>
            <div id="company-h1">
              <h1>{companyName}</h1>
              {(showCrew || showManager) && employeeName && <h6>{employeeName}</h6>}
            </div>
          </>
        )}
      </nav>
      
      {/* Menus */}
      {showNotLoggedIn && (
        <div className={`mobile ${isOpen ? "open" : ""}`} id="hamburger-nav">
          <NavLink to="/login" className="nav-link" onClick={() => setIsOpen(false)}>
            Log in / Sign up
            <hr className="hamburger-line" />
          </NavLink>
          <NavLink to="/" end className="nav-link" onClick={() => setIsOpen(false)}>
            Home
            <hr className="hamburger-line" />
          </NavLink>
        </div>
      )}

      {showCrew && (
        <div className={`mobile ${isOpen ? "open" : ""}`} id="hamburger-nav">
          <NavLink to="/login" className="nav-link" onClick= {() => {setIsOpen(false); logout();}}>
            Logout
            <hr className="hamburger-line" />
          </NavLink>
          <NavLink to="/loggedIn" end className="nav-link" onClick={() => setIsOpen(false)}>
            Home
            <hr className="hamburger-line" />
          </NavLink>
        </div>
      )}

      {showManager && (
        <div className={`mobile ${isOpen ? "open" : ""}`} id="hamburger-nav">
          <NavLink to="/login" className="nav-link" onClick= {() => {setIsOpen(false); logout();}}>
            Logout
            <hr className="hamburger-line" />
          </NavLink>
          <NavLink to="/loggedIn" end className="nav-link" onClick={() => setIsOpen(false)}>
            Home
            <hr className="hamburger-line" />
          </NavLink>
          <NavLink to="/loggedIn/Jobs" className="nav-link" onClick={() => setIsOpen(false)}>
            Jobs
            <hr className="hamburger-line" />
          </NavLink>
          <NavLink to="/tools" className="nav-link" onClick={() => setIsOpen(false)}>
            Tools
            <hr className="hamburger-line" />
          </NavLink>
          <NavLink to="/materials" className="nav-link" onClick={() => setIsOpen(false)}>
            Materials
            <hr className="hamburger-line" />
          </NavLink>
        </div>
      )}

      {showOwner && (
        <div className={`mobile ${isOpen ? "open" : ""}`} id="hamburger-nav">
          <NavLink to="/login" className="nav-link"  onClick= {() => {setIsOpen(false); logout();}}>
            Logout
            <hr className="hamburger-line" />
          </NavLink>
          <NavLink to="/loggedIn" end className="nav-link" onClick={() => setIsOpen(false)}>
            Home
            <hr className="hamburger-line" />
          </NavLink>
          <NavLink to="/loggedIn/Jobs" className="nav-link" onClick={() => setIsOpen(false)}>
            Jobs
            <hr className="hamburger-line" />
          </NavLink>
          <NavLink to="/loggedIn/tools" className="nav-link" onClick={() => setIsOpen(false)}>
            Tools
            <hr className="hamburger-line" />
          </NavLink>
          <NavLink to="/loggedIn/materials" className="nav-link" onClick={() => setIsOpen(false)}>
            Materials
            <hr className="hamburger-line" />
          </NavLink>
          <NavLink to="/loggedIn/manage-employees" className="nav-link" onClick={() => setIsOpen(false)}>
            Manage Employees
          </NavLink>
        </div>
      )}
    </header>
  );
}