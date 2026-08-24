import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useProjects } from "../context/ProjectsContext.jsx";
import MotionProjectCard from "../components/motion/MotionProjectCard.jsx";
import MotionEssenceSection from "../components/motion/MotionEssenceSection.jsx";
import MotionToolkitSection from "../components/motion/MotionToolkitSection.jsx";
import MotionContactFooter from "../components/motion/MotionContactFooter.jsx";
import {
  DEFAULT_MOTION,
  DEFAULT_MOTION_HERO,
  DEFAULT_MOTION_TOOLS,
  MOTION_INITIAL_COUNT,
} from "../data/motionDefaults.js";
function MotionProjectModal({ project, onClose }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  useEffect(() => {
    videoRef.current?.play().catch(() => {});
  }, [project]);

  if (!project) return null;

  return (
    <div className="motion-modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="motion-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="motion-modal-title"
      >
        <button type="button" className="motion-modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <div className="motion-modal-video-wrap">
          <video
            ref={videoRef}
            className="motion-modal-video"
            src={project.video}
            poster={project.image}
            controls
            autoPlay
            playsInline
          />
        </div>
        <div className="motion-modal-body">
          <div className="motion-modal-meta">
            <span>{project.year}</span>
            <span>{project.category}</span>
          </div>
          <h2 id="motion-modal-title" className="motion-modal-title">
            {project.title}
          </h2>
          <p className="motion-modal-subtitle">{project.subtitle}</p>
          {project.description && (
            <p className="motion-modal-description">{project.description}</p>
          )}
          {project.tools?.length > 0 && (
            <div className="motion-modal-tools">
              {project.tools.map((tool) => (
                <span key={tool} className="motion-card-tool">
                  {tool}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Motion() {
  const { data } = useProjects();
  const contact = data?.SITE?.contact;
  const hero = data?.SITE?.motionHero || DEFAULT_MOTION_HERO;
  const projects = data?.SITE?.motion?.length ? data.SITE.motion : DEFAULT_MOTION;
  const motionTools = data?.SITE?.motionTools?.length
    ? data.SITE.motionTools
    : DEFAULT_MOTION_TOOLS;

  const [activeId, setActiveId] = useState(null);
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const workRef = useRef(null);

  const visibleProjects = showAllProjects
    ? projects
    : projects.slice(0, MOTION_INITIAL_COUNT);
  const hasMoreProjects = projects.length > MOTION_INITIAL_COUNT;

  const expandProjects = () => {
    setShowAllProjects(true);
    requestAnimationFrame(() => scrollToSection("work"));
  };

  const collapseProjects = () => {
    setShowAllProjects(false);
    setActiveId(null);
    requestAnimationFrame(() => scrollToSection("work"));
  };

  useEffect(() => {
    document.body.classList.add("motion-active");
    return () => document.body.classList.remove("motion-active");
  }, []);

  return (
    <div className="motion-page">
      <section className="motion-hero" aria-label="Introduction">
        <video
          className="motion-hero-video"
          src={hero.video}
          poster={hero.poster}
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="motion-hero-overlay" aria-hidden="true" />

        <header className="motion-topbar">
          <Link to="/" className="motion-logo">
            Back to Home
          </Link>
        </header>

        <div className="motion-hero-body">
          <div className="motion-hero-copy">
            <div className="motion-hero-heading">
              <h1 className="motion-hero-name">Mohamed Elgaili</h1>
              <p className="motion-hero-role">Senior Motion Designer / Creative Director</p>
            </div>
            <nav className="motion-section-nav" aria-label="Page sections">
              <button type="button" onClick={expandProjects}>
                Work
              </button>
              <button type="button" onClick={() => scrollToSection("about")}>
                About
              </button>
              <button type="button" onClick={() => scrollToSection("contact")}>
                Contact
              </button>
            </nav>
          </div>

          <div id="work" ref={workRef} className="motion-work-section">
            <div
              className={`motion-projects${showAllProjects ? " is-expanded" : ""}`}
              onMouseLeave={() => setActiveId(null)}
            >
              {visibleProjects.map((project, index) => {
                const id = project.id || project.title;
                const enterMode =
                  showAllProjects && index >= MOTION_INITIAL_COUNT ? "expand" : "initial";
                return (
                  <MotionProjectCard
                    key={id}
                    project={project}
                    index={
                      enterMode === "expand" ? index - MOTION_INITIAL_COUNT : index
                    }
                    enterMode={enterMode}
                    active={activeId === id}
                    onActivate={setActiveId}
                    onDeactivate={(leavingId) => {
                      setActiveId((current) => (current === leavingId ? null : current));
                    }}
                    onOpen={setSelectedProject}
                  />
                );
              })}
            </div>

            {hasMoreProjects && !showAllProjects && (
              <div className="motion-projects-actions motion-enter-more">
                <button type="button" className="motion-more-btn" onClick={expandProjects}>
                  More projects
                </button>
              </div>
            )}

            {hasMoreProjects && showAllProjects && (
              <div className="motion-projects-actions">
                <button type="button" className="motion-more-btn" onClick={collapseProjects}>
                  Show less
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <MotionEssenceSection />

      <MotionToolkitSection tools={motionTools} />

      <MotionContactFooter contact={contact} />

      {selectedProject && (
        <MotionProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
      )}
    </div>
  );
}
