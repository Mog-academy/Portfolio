import React from "react";
import { useProjects } from "../context/ProjectsContext.jsx";
import ProjectGrid from "../components/ProjectGrid.jsx";

export default function Home() {
  const { data, loading } = useProjects();

  if (loading || !data) {
    return <div className="container"><p>Loading...</p></div>;
  }

  return (
    <div className="container">


      <section className="work">
        <div className="work-header">
          
        </div>

        <ProjectGrid projects={data.PROJECTS} />
      </section>
    </div>
  );
}
