import React from "react";
import { Link } from "react-router-dom";

export default function ProjectCard({ project }) {
  return (
    <Link to={`/project/${project.slug}`} className="card" aria-label={`${project.brand} project`}>
      <div className="card-media">
        <img src={project.cover.src} alt={project.cover.alt} loading="lazy" />
        <div className="card-overlay">
          <div className="card-title">{project.title}</div>
        </div>
      </div>
    </Link>
  );
}
