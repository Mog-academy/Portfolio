import React from "react";
import { Link, NavLink } from "react-router-dom";
import { SITE } from "../data/projects.js";

export default function Navbar() {
  return (
    <div className="sidebar-inner">
      <nav className="sidebar-nav" aria-label="Primary">
        <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")}>Work</NavLink>
        <NavLink to="/philosophy" className={({ isActive }) => (isActive ? "active" : "")}>Philosophy</NavLink>
        <a href="https://www.mog-academy.com" target="_blank" rel="noreferrer">Academy</a>
      </nav>
    </div>
  );
}
