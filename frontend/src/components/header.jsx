import { useEffect, useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import "../styles/header.css";

function decodeJwt(t){
  try{
    const b=t.split(".")[1].replace(/-/g,"+").replace(/_/g,"/");
    return JSON.parse(atob(b))
  }catch{return null}
}

function isJwtValid(t){
  const p=decodeJwt(t);
  return !!p && p.exp*1000 > Date.now()
}

export default function Header() {
  // read once for first render
  const userRaw = sessionStorage.getItem("tft_user");
  let user = null;
  try { user = userRaw ? JSON.parse(userRaw) : null; } catch {}

  const initialToken = sessionStorage.getItem("tft_token") || "";
  if (!window.accessToken) window.accessToken = initialToken;

  const [companyName, setCompanyName] = useState(user?.companyName ?? "");
  const [role, setRole] = useState(user?.role ?? null);
  const [employeeName, setEmployeeName] = useState(user?.name ?? "");
  const [loggedIn, setLoggedIn] = useState(!!initialToken && isJwtValid(initialToken));
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  //listen for the custom event and rehydrate state
  useEffect(() => {
    const onAuthChanged = () => {
      const t = sessionStorage.getItem("tft_token") || "";
      const raw = sessionStorage.getItem("tft_user");
      let u = null; try { u = raw ? JSON.parse(raw) : null; } catch {}

      window.accessToken = t;
      setLoggedIn(!!t && isJwtValid(t));
      setCompanyName(u?.companyName ?? "");
      setRole(u?.role ?? null);
      setEmployeeName(u?.name ?? "");
    };

    window.addEventListener("tft-auth-changed", onAuthChanged);
    return () => window.removeEventListener("tft-auth-changed", onAuthChanged);
  }, []);

  const logout = () => {
    window.accessToken = "";
    sessionStorage.removeItem("tft_token");
    sessionStorage.removeItem("tft_user");
    setLoggedIn(false);
    setRole(null);
    setCompanyName("");
    setEmployeeName("");
    setIsOpen(false);
    navigate("/login", { replace: true });
  };

  const showNotLoggedIn = !loggedIn;
  const showCrew = loggedIn && role === "crew";
  const showManager = loggedIn && role === "manager";
  const showOwner = loggedIn && role === "owner";

  return (
    <header className="mobile">
      <nav>
        <button className="hamburger" id="hamburger" onClick={() => setIsOpen(o=>!o)}>☰</button>

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
              <Link to="/" onClick={() => setIsOpen(false)}>
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
          <NavLink to="/login" className="nav-link" onClick={logout}>
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
          <NavLink to="/login" className="nav-link" onClick={logout}>
            Logout
            <hr className="hamburger-line" />
          </NavLink>
          <NavLink to="/loggedIn" end className="nav-link" onClick={() => setIsOpen(false)}>
            Home
            <hr className="hamburger-line" />
          </NavLink>
          <NavLink to="/jobs" className="nav-link" onClick={() => setIsOpen(false)}>
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
          <NavLink to="/login" className="nav-link" onClick={logout}>
            Logout
            <hr className="hamburger-line" />
          </NavLink>
          <NavLink to="/loggedIn" end className="nav-link" onClick={() => setIsOpen(false)}>
            Home
            <hr className="hamburger-line" />
          </NavLink>
          <NavLink to="/jobs" className="nav-link" onClick={() => setIsOpen(false)}>
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
          <NavLink to="/manage-employees" className="nav-link" onClick={() => setIsOpen(false)}>
            Manage Employees
          </NavLink>
        </div>
      )}
    </header>
  );
}