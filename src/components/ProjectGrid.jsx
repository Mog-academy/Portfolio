import React, { useState } from "react";
import ProjectCard from "./ProjectCard.jsx";

export default function ProjectGrid({ projects }) {
  const [centerCardIndex, setCenterCardIndex] = useState(null);

  return (
    <section className="mosaic-grid">
      {projects.map((p, index) => (
        <div key={p.slug} className="tile">
          <ProjectCard 
            project={p} 
            index={index}
            isCentered={centerCardIndex === index}
            onCenterChange={setCenterCardIndex}
          />
        </div>
      ))}
    </section>
  )
}
