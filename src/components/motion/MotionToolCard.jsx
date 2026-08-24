import React, { useEffect, useRef, useState } from "react";

export default function MotionToolCard({
  tool,
  index,
  editorMode = false,
  selected = false,
  onEditorSelect,
}) {
  const videoRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const hasVideo = !!tool.video && !tool.video.match(/\.(jpg|jpeg|png|webp|gif)(\?|$)/i);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !hasVideo) return;
    if (hovered) {
      el.currentTime = 0;
      el.play().catch(() => {});
    } else {
      el.pause();
      el.currentTime = 0;
    }
  }, [hovered, hasVideo]);

  const handleClick = () => {
    if (editorMode) onEditorSelect?.();
  };

  const handleKeyDown = (event) => {
    if (!editorMode) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onEditorSelect?.();
    }
  };

  return (
    <article
      className={`motion-tool-card${hovered ? " is-hovered" : ""}${editorMode && selected ? " is-editor-selected" : ""}`}
      style={{ "--tool-index": index }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={editorMode ? "button" : undefined}
      tabIndex={editorMode ? 0 : undefined}
    >
      <div className="motion-tool-card-media">
        {hasVideo && (
          <video
            ref={videoRef}
            className="motion-tool-card-video"
            src={tool.video}
            muted
            loop
            playsInline
            preload="metadata"
          />
        )}
        {!hasVideo && tool.video && (
          <img className="motion-tool-card-fallback" src={tool.video} alt="" />
        )}
        <div className={`motion-tool-card-logo${hovered && hasVideo ? " is-hidden" : ""}`}>
          <img src={tool.logo} alt="" loading="lazy" decoding="async" />
        </div>
      </div>
      <h3 className="motion-tool-card-name">{tool.name}</h3>
    </article>
  );
}
