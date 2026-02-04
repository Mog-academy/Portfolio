import React from "react";
import { Link, NavLink } from "react-router-dom";
import { useProjects } from "../context/ProjectsContext.jsx";

export default function Navbar() {
  const { data, loading } = useProjects();

  if (loading || !data) return null;

  const { SITE } = data;
  return (
    <div className="sidebar-inner">
      <nav className="sidebar-nav" aria-label="Primary">
        <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")}>Event Design</NavLink>
        <a href="https://mjeeli.artstation.com" target="_blank" rel="noreferrer">Motion Design</a>
        <NavLink to="/philosophy" className={({ isActive }) => (isActive ? "active" : "")}>Philosophy</NavLink>
        <a href="https://www.mog-academy.com" target="_blank" rel="noreferrer">Academy</a>
      </nav>
    </div>
  );
}
