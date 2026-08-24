import React, { useEffect, useRef, useState } from "react";
import MotionToolCard from "./MotionToolCard.jsx";
import { DEFAULT_MOTION_TOOLS } from "../../data/motionDefaults.js";

export default function MotionToolkitSection({
  tools = DEFAULT_MOTION_TOOLS,
  preview = false,
  editorMode = false,
  selection,
  onSelectTool,
}) {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(preview);

  useEffect(() => {
    if (preview) return undefined;
    const node = sectionRef.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [preview]);

  return (
    <section
      id="toolkit"
      ref={sectionRef}
      className={`motion-toolkit${visible ? " is-visible" : ""}${preview ? " is-preview" : ""}`}
      aria-labelledby="motion-toolkit-heading"
    >
      <div className="motion-toolkit-inner">
        <span className="motion-section-label">Toolkit</span>

        <div className="motion-toolkit-lead">
          <h2 id="motion-toolkit-heading" className="motion-toolkit-title">
            The tools behind the work
          </h2>
          <p className="motion-about-highlight">
            The technical side is what gives me the freedom to explore those ideas.
          </p>
          <p className="motion-toolkit-copy">
            I work with Blender 3D, Adobe After Effects, Adobe Premiere, Adobe Audition, Marvelous
            Designer, and Substance Painter across 3D, animation, compositing, and editing. I see
            these tools as a creative toolkit rather than a fixed workflow.
          </p>
        </div>

        <div className="motion-toolkit-grid" aria-label="Software toolkit">
          {tools.map((tool, index) => (
            <MotionToolCard
              key={tool.id || index}
              tool={tool}
              index={index}
              editorMode={editorMode}
              selected={selection?.type === "motion-tool" && selection.index === index}
              onEditorSelect={() => onSelectTool?.(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
