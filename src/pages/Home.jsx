import React from "react";
import { PROJECTS, SITE } from "../data/projects.js";
import ProjectGrid from "../components/ProjectGrid.jsx";

export default function Home() {
  return (
    <div className="container">


      <section className="work">
        <div className="work-header">
          
        </div>

        <ProjectGrid projects={PROJECTS} />
      </section>
    </div>
  );
}
