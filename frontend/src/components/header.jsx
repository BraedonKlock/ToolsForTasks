// src/components/Header.jsx
import React, { useState } from "react";
import "../styles/header.css";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  function toggleMenu() {
    setIsOpen(!isOpen);
  }

  return (
    <header className="mobile">
      <nav>
        <button className="hamburger" id="hamburger" onClick={toggleMenu}>
          ☰
        </button>

        <div id="logoContainer">
          <img id="logo" src="/images/lg.png" alt="Tools for Tasks logo" />
        </div>
      </nav>

      <div id="hamburger-nav" className={isOpen ? "open" : ""}>
        <a href="/login">
          Log in / Sign up
          <hr className="hamburger-line" />
        </a>
        <a href="/">
          Home
          <hr className="hamburger-line" />
        </a>
      </div>
    </header>
  );
}
