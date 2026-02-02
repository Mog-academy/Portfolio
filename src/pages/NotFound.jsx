import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="container">
      <div className="notfound">
        <h1 className="project-title">404</h1>
        <p className="p">That page doesn’t exist.</p>
        <Link className="btn" to="/">Back to work</Link>
      </div>
    </div>
  );
}
