import React from "react";
import MotionEditorPreview from "./MotionEditorPreview.jsx";

function VisualCard({ label, sublabel, image, logo, selected, onClick }) {
  return (
    <button type="button" className={`ed-vcard${selected ? " is-selected" : ""}`} onClick={onClick}>
      <div className={`ed-vcard-media${logo ? " is-logo" : ""}`}>
        {image ? <img src={image} alt="" /> : <span className="ed-vcard-empty">No image</span>}
      </div>
      <span className="ed-vcard-label">{label}</span>
      {sublabel && <span className="ed-vcard-sublabel">{sublabel}</span>}
    </button>
  );
}

function GateMockup({ siteInfo, gate, selection, onSelect, compact }) {
  return (
    <div className={`ed-mock ed-mock-gate${compact ? " is-compact" : ""}`}>
      <div className="ed-mock-gate-inner">
        <p className="ed-mock-gate-name">{siteInfo.name || "Mohamed Elgaili"}</p>
        <p className="ed-mock-gate-sub">Multidisciplinary Creative</p>
        <div className="ed-mock-gate-tiles">
          {gate.map((dest, index) => (
            <VisualCard
              key={dest.id || index}
              label={dest.label}
              image={dest.image}
              logo={dest.logo}
              selected={selection?.type === "gate" && selection.index === index}
              onClick={() => onSelect({ type: "gate", index })}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function EventsMockup({ projects, selection, onSelect, compact }) {
  return (
    <div className={`ed-mock ed-mock-events${compact ? " is-compact" : ""}`}>
      <div className="ed-mock-events-grid">
        {projects.map((project, index) => (
          <VisualCard
            key={project.slug || index}
            label={project.brand || project.title || `Project ${index + 1}`}
            sublabel={project.slug}
            image={project.cover?.src}
            selected={selection?.type === "event" && selection.index === index}
            onClick={() => onSelect({ type: "event", index })}
          />
        ))}
      </div>
    </div>
  );
}

export default function EditorPreview({ view, siteInfo, projects, selection, onSelect }) {
  const gate = siteInfo.gate || [];
  const motion = siteInfo.motion || [];
  const motionHero = siteInfo.motionHero || {};

  if (view === "overview") {
    return (
      <div className="ed-overview">
        <section className="ed-overview-block">
          <div className="ed-overview-head">
            <h3>Home Gate</h3>
            <span>/</span>
          </div>
          <GateMockup
            siteInfo={siteInfo}
            gate={gate}
            selection={selection}
            onSelect={(sel) => onSelect(sel, "home")}
            compact
          />
        </section>
        <section className="ed-overview-block">
          <div className="ed-overview-head">
            <h3>Motion Page</h3>
            <span>/motion</span>
          </div>
          <MotionEditorPreview
            siteInfo={siteInfo}
            motionHero={motionHero}
            motion={motion}
            motionTools={siteInfo.motionTools}
            selection={selection}
            onSelect={(sel) => onSelect(sel, "motion")}
            compact
          />
        </section>
        <section className="ed-overview-block">
          <div className="ed-overview-head">
            <h3>Event Design</h3>
            <span>/events</span>
          </div>
          <EventsMockup
            projects={projects}
            selection={selection}
            onSelect={(sel) => onSelect(sel, "events")}
            compact
          />
        </section>
      </div>
    );
  }

  if (view === "home") {
    return (
      <GateMockup
        siteInfo={siteInfo}
        gate={gate}
        selection={selection}
        onSelect={onSelect}
      />
    );
  }

  if (view === "motion") {
    return (
      <MotionEditorPreview
        siteInfo={siteInfo}
        motionHero={motionHero}
        motion={motion}
        motionTools={siteInfo.motionTools}
        selection={selection}
        onSelect={onSelect}
      />
    );
  }

  if (view === "events") {
    return (
      <EventsMockup projects={projects} selection={selection} onSelect={onSelect} />
    );
  }

  if (view === "site") {
    return (
      <div className="ed-mock ed-mock-site">
        <div className="ed-mock-site-card">
          <p className="ed-mock-site-name">{siteInfo.name}</p>
          <p className="ed-mock-site-role">{siteInfo.role}</p>
          <p className="ed-mock-site-location">{siteInfo.location}</p>
          <p className="ed-mock-site-headline">{siteInfo.headline}</p>
          <p className="ed-mock-site-intro">{siteInfo.intro}</p>
        </div>
        <p className="ed-mock-hint">Edit site details in the panel on the right.</p>
      </div>
    );
  }

  return null;
}
