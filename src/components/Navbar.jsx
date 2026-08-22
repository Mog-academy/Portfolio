import React from "react";
import { Link, NavLink } from "react-router-dom";
import { useProjects } from "../context/ProjectsContext.jsx";

export default function Navbar() {
  const { data, loading } = useProjects();

  if (loading || !data) return null;

  return (
    <div className="sidebar-inner">
      <nav className="sidebar-nav" aria-label="Primary">
        <Link to="/">Home</Link>
        <NavLink to="/events" className={({ isActive }) => (isActive ? "active" : "")}>Event Design</NavLink>
        <NavLink to="/motion" className={({ isActive }) => (isActive ? "active" : "")}>Motion Design</NavLink>
        <NavLink to="/philosophy" className={({ isActive }) => (isActive ? "active" : "")}>Philosophy</NavLink>
        <a href="https://www.mog-academy.com" target="_blank" rel="noreferrer">Academy</a>
      </nav>
    </div>
  );
}
