import React from "react";
import ProjectCard from "./ProjectCard.jsx";

export default function ProjectGrid({ projects }) {
  return (
    <section className="mosaic-grid">
      {projects.map((p) => (
        <div key={p.slug} className="tile">
          <ProjectCard project={p} />
        </div>
      ))}
    </section>
  )
}
