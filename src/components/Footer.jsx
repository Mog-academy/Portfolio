import React from "react";
import { Link, useLocation } from "react-router-dom";
import { SITE } from "../data/projects.js";

export default function Footer() {
  const year = new Date().getFullYear();
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <footer className="footer site-footer">
      <div className="container">
        {!isHomePage && (
          <div className="footer-back">
            <Link to="/" className="back-to-projects-btn">← Back to Projects</Link>
          </div>
        )}
        <div className="footer-bottom">
          <small>© {year}. All rights reserved.</small>
        </div>
      </div>
    </footer>
  );
}
