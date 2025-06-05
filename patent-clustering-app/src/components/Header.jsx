import React, { useState, useEffect } from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSun, faMoon, faBars } from "@fortawesome/free-solid-svg-icons";

function Header() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    document.documentElement.setAttribute("data-bs-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <Navbar expand="lg" className="full-width navbar" data-testid="navbar">
      <Container>
        <Navbar.Brand as={NavLink} to="/" data-testid="navbar-brand">
          Patent Explorer
        </Navbar.Brand>
        <Navbar.Toggle
          aria-controls="basic-navbar-nav"
          data-testid="navbar-toggle"
        >
          <FontAwesomeIcon icon={faBars} className="navbar-toggler-icon" />
        </Navbar.Toggle>
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
              data-testid="nav-home"
            >
              Home
            </NavLink>
            <NavLink
              to="/clusters"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
              data-testid="nav-clusters"
            >
              Clusters
            </NavLink>
            <NavLink
              to="/patents"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
              data-testid="nav-patents"
            >
              Patents
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
              data-testid="nav-about"
            >
              About
            </NavLink>
            <NavLink
              to="/upload"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
              data-testid="nav-upload"
            >
              Upload
            </NavLink>
            <NavLink
              to="/keywords"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
              data-testid="nav-keywords"
            >
              Keywords
            </NavLink>
          </Nav>
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            data-testid="theme-toggle"
          >
            <FontAwesomeIcon icon={theme === "light" ? faMoon : faSun} />
          </button>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;
