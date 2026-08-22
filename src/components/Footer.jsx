import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useProjects } from "../context/ProjectsContext.jsx";

export default function Footer() {
  const { data, loading } = useProjects();
  const year = new Date().getFullYear();
  const location = useLocation();
  const isEventsPage = location.pathname === "/events";

  if (loading || !data) return null;

  return (
    <footer className="footer site-footer">
      <div className="container">
        {!isEventsPage && (
          <div className="footer-back">
            <Link to="/events" className="back-to-projects-btn">← Back to Projects</Link>
          </div>
        )}
        <div className="footer-bottom">
          <small>© {year}. All rights reserved.</small>
        </div>
      </div>
    </footer>
  );
}
