import React, { useRef, useState } from "react";
import MotionProjectCard from "../motion/MotionProjectCard.jsx";
import MotionEssenceSection from "../motion/MotionEssenceSection.jsx";
import MotionToolkitSection from "../motion/MotionToolkitSection.jsx";
import MotionContactFooter from "../motion/MotionContactFooter.jsx";
import { DEFAULT_MOTION_TOOLS, MOTION_INITIAL_COUNT } from "../../data/motionDefaults.js";

export default function MotionEditorPreview({
  siteInfo,
  motionHero,
  motion,
  motionTools,
  selection,
  onSelect,
  onReorder,
  compact = false,
}) {
  const [activeId, setActiveId] = useState(null);
  const [dragIndex, setDragIndex] = useState(null);
  const [dropIndex, setDropIndex] = useState(null);
  const skipClickRef = useRef(false);
  const contact = siteInfo?.contact;
  const hero = motionHero || {};
  const projects = motion || [];
  const tools = motionTools?.length ? motionTools : DEFAULT_MOTION_TOOLS;
  const showExpanded = projects.length > MOTION_INITIAL_COUNT;

  const handleHeroBackgroundClick = (event) => {
    if (event.target.closest(".motion-card")) return;
    if (event.target.closest(".motion-more-btn")) return;
    if (event.target.closest(".motion-tool-card")) return;
    onSelect({ type: "motion-hero" });
  };

  const handleDragStart = (index, event) => {
    skipClickRef.current = false;
    setDragIndex(index);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(index));
  };

  const handleDragOver = (index, event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    if (dropIndex !== index) setDropIndex(index);
  };

  const handleDrop = (index, event) => {
    event.preventDefault();
    event.stopPropagation();
    const from = Number(event.dataTransfer.getData("text/plain"));
    skipClickRef.current = true;
    onReorder?.(from, index);
    setDragIndex(null);
    setDropIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDropIndex(null);
  };

  return (
    <div className={`motion-page ed-motion-live${compact ? " is-compact" : ""}`}>
      <section
        className={`motion-hero${selection?.type === "motion-hero" ? " is-editor-selected" : ""}`}
        aria-label="Introduction"
        onClick={handleHeroBackgroundClick}
        onKeyDown={() => {}}
        role="presentation"
      >
        {hero.video ? (
          <video
            className="motion-hero-video"
            src={hero.video}
            poster={hero.poster}
            autoPlay
            muted
            loop
            playsInline
          />
        ) : hero.poster ? (
          <img className="motion-hero-video ed-motion-hero-poster" src={hero.poster} alt="" />
        ) : (
          <div className="motion-hero-video ed-motion-hero-empty" aria-hidden="true" />
        )}
        <div className="motion-hero-overlay" aria-hidden="true" />

        <header className="motion-topbar">
          <span className="motion-logo">Back to Home</span>
        </header>

        <div className="motion-hero-body">
          <div className="motion-hero-copy">
            <div className="motion-hero-heading">
              <h1 className="motion-hero-name">{siteInfo?.name || "Mohamed Elgaili"}</h1>
              <p className="motion-hero-role">Senior Motion Designer / Creative Director</p>
            </div>
            <nav className="motion-section-nav" aria-label="Page sections">
              <button type="button" tabIndex={-1}>
                Work
              </button>
              <button type="button" tabIndex={-1}>
                About
              </button>
              <button type="button" tabIndex={-1}>
                Contact
              </button>
            </nav>
          </div>

          <div id="work" className="motion-work-section">
            <div
              className={`motion-projects${showExpanded ? " is-expanded" : ""}`}
              onMouseLeave={() => setActiveId(null)}
            >
              {projects.map((project, index) => {
                const id = project.id || project.title || String(index);
                return (
                  <MotionProjectCard
                    key={id}
                    project={project}
                    index={index}
                    enterMode="initial"
                    active={activeId === id}
                    onActivate={setActiveId}
                    onDeactivate={(leavingId) => {
                      setActiveId((current) => (current === leavingId ? null : current));
                    }}
                    editorMode
                    selected={selection?.type === "motion" && selection.index === index}
                    onEditorSelect={() => {
                      if (skipClickRef.current) {
                        skipClickRef.current = false;
                        return;
                      }
                      onSelect({ type: "motion", index });
                    }}
                    draggable={Boolean(onReorder)}
                    dragging={dragIndex === index}
                    dropTarget={dropIndex === index && dragIndex !== index}
                    onDragStart={(event) => handleDragStart(index, event)}
                    onDragOver={(event) => handleDragOver(index, event)}
                    onDrop={(event) => handleDrop(index, event)}
                    onDragEnd={handleDragEnd}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <MotionEssenceSection preview />

      <MotionToolkitSection
        tools={tools}
        preview
        editorMode
        selection={selection}
        onSelectTool={(index) => onSelect({ type: "motion-tool", index })}
      />

      <MotionContactFooter contact={contact} preview />
    </div>
  );
}
