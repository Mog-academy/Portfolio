import React, { useEffect, useRef } from "react";

export default function MotionProjectCard({
  project,
  index,
  enterMode = "initial",
  active,
  onActivate,
  onDeactivate,
  onOpen,
  editorMode = false,
  selected = false,
  onEditorSelect,
  draggable = false,
  dragging = false,
  dropTarget = false,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}) {
  const videoRef = useRef(null);
  const { title, subtitle, category, year, image, video, tools } = project;

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (active) {
      el.currentTime = 0;
      el.play().catch(() => {});
    } else {
      el.pause();
      el.currentTime = 0;
    }
  }, [active]);

  const handleClick = () => {
    if (editorMode) {
      onEditorSelect?.();
      return;
    }
    onOpen?.(project);
  };

  return (
    <article
      className={`motion-card motion-card-${enterMode}${active ? " is-hovered" : ""}${editorMode && selected ? " is-editor-selected" : ""}${dragging ? " is-dragging" : ""}${dropTarget ? " is-drop-target" : ""}`}
      style={{ "--motion-index": index }}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      onMouseEnter={() => onActivate(project.id || project.title)}
      onMouseLeave={(e) => {
        const next = e.relatedTarget;
        if (next && typeof next.closest === "function" && next.closest(".motion-card")) {
          return;
        }
        onDeactivate(project.id || project.title);
      }}
      onClick={(e) => {
        e.stopPropagation();
        handleClick();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="motion-card-media">
        {image ? (
          <img src={image} alt="" className="motion-card-image" />
        ) : (
          <div className="motion-card-image motion-card-placeholder" aria-hidden="true" />
        )}
        {video && (
          <video
            ref={videoRef}
            className="motion-card-video"
            src={video}
            muted
            loop
            playsInline
            preload="metadata"
          />
        )}
      </div>
      <div className="motion-card-meta">
        <div>
          <h3 className="motion-card-title">{title || "Untitled"}</h3>
          <p className="motion-card-subtitle">{subtitle}</p>
        </div>
        <span className="motion-card-year">{year}</span>
      </div>
      <div className="motion-card-footer">
        <div className="motion-card-tools">
          {tools?.map((tool) => (
            <span key={tool} className="motion-card-tool">
              {tool}
            </span>
          ))}
        </div>
        <span className="motion-card-category">{category}</span>
      </div>
    </article>
  );
}
