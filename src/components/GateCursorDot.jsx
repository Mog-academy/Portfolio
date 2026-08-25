import React, { useEffect, useRef } from "react";

export default function GateCursorDot() {
  const dotRef = useRef(null);

  useEffect(() => {
    const prefersFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!prefersFinePointer) return undefined;

    const pos = { cx: 0, cy: 0, ctx: 0, cty: 0 };
    let frame = 0;

    const onMove = (e) => {
      pos.ctx = e.clientX;
      pos.cty = e.clientY;
    };

    const tick = () => {
      pos.cx += (pos.ctx - pos.cx) * 0.22;
      pos.cy += (pos.cty - pos.cy) * 0.22;
      const dot = dotRef.current;
      if (dot) {
        dot.style.transform = `translate3d(${pos.cx}px, ${pos.cy}px, 0) translate(-50%, -50%)`;
      }
      frame = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    frame = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="gate-cursor-dot-shell is-ready" aria-hidden="true">
      <div ref={dotRef} className="gate-cursor-dot" />
    </div>
  );
}
