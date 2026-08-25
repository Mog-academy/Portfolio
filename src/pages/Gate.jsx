import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import GateNameAnimation from "../components/GateNameAnimation.jsx";
import { useProjects } from "../context/ProjectsContext.jsx";

export const DEFAULT_GATE = [
  {
    id: "motion",
    label: "Motion Design",
    to: "/motion",
    external: false,
    image: "/project_images/media-3.jpg",
    video: "/project_images/media-30.mp4",
    logo: false,
  },
  {
    id: "events",
    label: "Event Design",
    to: "/events",
    external: false,
    image: "/project_images/media-1.jpg",
    video: "/project_images/media-57.mp4",
    logo: false,
  },
  {
    id: "archviz",
    label: "Architectural Visualization",
    to: "https://mog-renders.com",
    external: true,
    image: "/gate/mog-renders-logo.png",
    video: "/project_images/1770066502689-1nsc3an6l.mp4",
    logo: true,
  },
  {
    id: "academy",
    label: "My Academy",
    to: "https://www.mog-academy.com",
    external: true,
    image: "/gate/mog-academy-logo.png",
    video: "/project_images/1770066640012-36lhnch4l.mp4",
    logo: true,
  },
];

function sampleGlowColor(img) {
  try {
    const size = 24;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return "180, 180, 180";
    ctx.drawImage(img, 0, 0, size, size);
    const { data } = ctx.getImageData(0, 0, size, size);

    let r = 0;
    let g = 0;
    let b = 0;
    let n = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 140) continue;
      const pr = data[i];
      const pg = data[i + 1];
      const pb = data[i + 2];
      // Skip near-white / near-black so logos still yield a useful hue
      if (pr > 248 && pg > 248 && pb > 248) continue;
      if (pr < 12 && pg < 12 && pb < 12) continue;
      r += pr;
      g += pg;
      b += pb;
      n += 1;
    }
    if (!n) return "180, 180, 180";

    r /= n;
    g /= n;
    b /= n;

    // Mild saturation boost so the glow reads clearly on dark UI
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const mid = (max + min) / 2;
    if (max > min) {
      const amount = 0.35;
      r = mid + (r - mid) * (1 + amount);
      g = mid + (g - mid) * (1 + amount);
      b = mid + (b - mid) * (1 + amount);
    }

    return `${Math.round(Math.min(255, Math.max(0, r)))}, ${Math.round(Math.min(255, Math.max(0, g)))}, ${Math.round(Math.min(255, Math.max(0, b)))}`;
  } catch {
    return "180, 180, 180";
  }
}

function DestinationLink({
  id,
  label,
  to,
  external,
  image,
  video,
  logo,
  active,
  index = 0,
  onActivate,
  onDeactivate,
}) {
  const videoRef = useRef(null);
  const imageRef = useRef(null);
  const [glow, setGlow] = useState("180, 180, 180");

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

  useEffect(() => {
    setGlow("180, 180, 180");
    const img = imageRef.current;
    if (!img) return;

    const apply = () => setGlow(sampleGlowColor(img));
    if (img.complete && img.naturalWidth > 0) {
      apply();
      return;
    }
    img.addEventListener("load", apply);
    return () => img.removeEventListener("load", apply);
  }, [image]);

  const content = (
    <>
      <span className="gate-label">{label}</span>
      <span className={`gate-media${logo ? " gate-media-logo" : ""}`}>
        <img
          ref={imageRef}
          src={image}
          alt=""
          className="gate-image"
          crossOrigin="anonymous"
          onLoad={(e) => setGlow(sampleGlowColor(e.currentTarget))}
        />
        {video && (
          <video
            ref={videoRef}
            className="gate-video"
            src={video}
            muted
            loop
            playsInline
            preload="metadata"
          />
        )}
      </span>
    </>
  );

  const sharedProps = {
    className: `gate-dest${active ? " is-hovered" : ""}`,
    style: {
      "--gate-index": index,
      "--gate-glow": glow,
    },
    onMouseEnter: () => onActivate(id),
    onMouseLeave: (e) => {
      const next = e.relatedTarget;
      if (next && typeof next.closest === "function" && next.closest(".gate-dest")) {
        return;
      }
      onDeactivate(id);
    },
  };

  if (external) {
    return (
      <a href={to} {...sharedProps} target="_blank" rel="noreferrer">
        {content}
      </a>
    );
  }

  return (
    <Link to={to} {...sharedProps}>
      {content}
    </Link>
  );
}

const TILE_STAGGER_MS = 500;
const TILE_ANIM_MS = 550;
const CARDS_DELAY_MS = 3500;
const WHO_DELAY_AFTER_MS = 600;
const CURSOR_HINT_GAP_Y = 34;

function isInteractiveTarget(target) {
  if (!target || typeof target.closest !== "function") return false;
  return Boolean(target.closest("a, button, [role='button']"));
}

function cardsFinishMs(cardCount) {
  const lastIndex = Math.max(0, cardCount - 1);
  return lastIndex * TILE_STAGGER_MS + TILE_ANIM_MS;
}

export default function Gate() {
  const { data } = useProjects();
  const contact = data?.SITE?.contact;
  const destinations = data?.SITE?.gate?.length ? data.SITE.gate : DEFAULT_GATE;
  const [activeId, setActiveId] = useState(null);
  const [animLoading, setAnimLoading] = useState(true);
  const [sequenceActive, setSequenceActive] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showWho, setShowWho] = useState(false);
  const [whoAnimate, setWhoAnimate] = useState(false);
  const [hintReady, setHintReady] = useState(false);
  const [hintHidden, setHintHidden] = useState(false);
  const [hintGuideReady, setHintGuideReady] = useState(false);
  const whoRef = useRef(null);
  const hintRef = useRef(null);
  const hintLineRef = useRef(null);
  const hintDotRef = useRef(null);
  const cursorDotRef = useRef(null);
  const cursorCircleRef = useRef(null);
  const hintPos = useRef({ x: 0, y: 0, tx: 0, ty: 0, cx: 0, cy: 0, ctx: 0, cty: 0 });
  const hintReadyRef = useRef(false);

  useEffect(() => {
    document.body.classList.add("gate-active");
    return () => document.body.classList.remove("gate-active");
  }, []);

  useEffect(() => {
    if (!sequenceActive) return undefined;
    setShowContact(false);
    const contactAt = cardsFinishMs(destinations.length);
    const contactTimer = setTimeout(() => setShowContact(true), contactAt);
    return () => clearTimeout(contactTimer);
  }, [destinations.length, sequenceActive]);

  useEffect(() => {
    if (!sequenceActive) return undefined;
    setShowWho(false);
    setWhoAnimate(false);
    const whoAt = cardsFinishMs(destinations.length) + WHO_DELAY_AFTER_MS;
    const timer = setTimeout(() => setShowWho(true), whoAt);
    return () => clearTimeout(timer);
  }, [destinations.length, sequenceActive]);

  useEffect(() => {
    if (!sequenceActive) return undefined;
    setHintGuideReady(false);
    const timer = setTimeout(() => setHintGuideReady(true), cardsFinishMs(destinations.length));
    return () => clearTimeout(timer);
  }, [destinations.length, sequenceActive]);

  useEffect(() => {
    const prefersFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!prefersFinePointer) return undefined;

    let frame = 0;
    const pos = hintPos.current;

    const tick = () => {
      pos.x += (pos.tx - pos.x) * 0.22;
      pos.y += (pos.ty - pos.y) * 0.22;
      pos.cx += (pos.ctx - pos.cx) * 0.22;
      pos.cy += (pos.cty - pos.cy) * 0.22;
      const el = hintRef.current;
      const line = hintLineRef.current;
      const endDot = hintDotRef.current;
      const cursorDot = cursorDotRef.current;
      if (el) {
        el.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, 0)`;
      }
      if (cursorDot) {
        cursorDot.style.transform = `translate3d(${pos.cx}px, ${pos.cy}px, 0) translate(-50%, -50%)`;
      }
      const circle = cursorCircleRef.current;
      const CIRCLE_R = 60;
      const CIRCLE_OFFSET_Y = 20;
      const circleCx = pos.cx;
      const circleCy = pos.cy + CIRCLE_OFFSET_Y;
      if (circle) {
        circle.setAttribute("cx", String(circleCx));
        circle.setAttribute("cy", String(circleCy));
      }
      if (line) {
        let nearest = null;
        let nearestDist = Infinity;
        document.querySelectorAll(".gate-dest").forEach((card) => {
          const box = card.getBoundingClientRect();
          const cx = box.left + box.width / 2;
          const cy = box.top + box.height / 2;
          const dist = (cx - circleCx) ** 2 + (cy - circleCy) ** 2;
          if (dist < nearestDist) {
            nearestDist = dist;
            nearest = { cx, cy };
          }
        });
        if (nearest) {
          const dx = nearest.cx - circleCx;
          const dy = nearest.cy - circleCy;
          const len = Math.hypot(dx, dy) || 1;
          const x1 = circleCx + (dx / len) * CIRCLE_R;
          const y1 = circleCy + (dy / len) * CIRCLE_R;
          const bulge = Math.min(90, len * 0.28);
          const cpx = (x1 + nearest.cx) / 2 - (dy / len) * bulge;
          const cpy = (y1 + nearest.cy) / 2 + (dx / len) * bulge;
          line.setAttribute("d", `M ${x1} ${y1} Q ${cpx} ${cpy} ${nearest.cx} ${nearest.cy}`);
          if (endDot) {
            endDot.setAttribute("cx", String(nearest.cx));
            endDot.setAttribute("cy", String(nearest.cy));
          }
        }
      }
      frame = window.requestAnimationFrame(tick);
    };

    const onMove = (event) => {
      pos.ctx = event.clientX;
      pos.cty = event.clientY;
      pos.tx = event.clientX;
      pos.ty = event.clientY + CURSOR_HINT_GAP_Y;
      if (!hintReadyRef.current) {
        pos.x = pos.tx;
        pos.y = pos.ty;
        pos.cx = pos.ctx;
        pos.cy = pos.cty;
        hintReadyRef.current = true;
        setHintReady(true);
      }
      setHintHidden(isInteractiveTarget(event.target));
    };

    const onLeave = (event) => {
      if (!event.relatedTarget) setHintHidden(true);
    };

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseout", onLeave);
    frame = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseout", onLeave);
    };
  }, []);

  useLayoutEffect(() => {
    if (!showWho) {
      setWhoAnimate(false);
      return;
    }

    const el = whoRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const fullTravel = Math.max(window.innerWidth - 24 - rect.width - rect.left, 0);
    const travel = Math.min(fullTravel, Math.min(window.innerWidth * 0.18, 140));
    el.style.setProperty("--who-travel", `${travel}px`);
    setWhoAnimate(true);
  }, [showWho]);

  return (
    <div
      className={`gate${sequenceActive ? " gate-sequence-active" : ""}${showContact ? " gate-contact-ready" : ""}${animLoading ? " gate-is-loading" : ""}`}
      style={{ "--gate-cards-delay": "0ms" }}
    >
      {animLoading && (
        <div className="gate-loading" aria-live="polite" aria-busy="true">
          <div className="gate-loader">
            <div className="gate-spinner" aria-hidden="true" />
          </div>
        </div>
      )}
      <div className="gate-inner">
        <header className="gate-intro-slot">
          <h1 className="sr-only">Mohamed Elgaili</h1>
          <p className="sr-only">Multidisciplinary Creative</p>
        </header>

        <nav
          className="gate-nav"
          aria-label="Destinations"
          onMouseLeave={() => setActiveId(null)}
        >
          {destinations.map((dest, index) => {
            const id = dest.id || dest.label;
            return (
              <DestinationLink
                key={id}
                {...dest}
                id={id}
                index={index}
                active={activeId === id}
                onActivate={setActiveId}
                onDeactivate={(leavingId) => {
                  setActiveId((current) => (current === leavingId ? null : current));
                }}
              />
            );
          })}
        </nav>

        {contact && (
          <div className="gate-contact">
            <a
              href={`mailto:${contact.email}`}
              className="gate-contact-link"
              aria-label="Email"
              style={{ "--contact-index": 0 }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
            </a>
            <a
              href={contact.linkedin}
              target="_blank"
              rel="noreferrer"
              className="gate-contact-link"
              aria-label="LinkedIn"
              style={{ "--contact-index": 1 }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
              </svg>
            </a>
            <a
              href={contact.instagram}
              target="_blank"
              rel="noreferrer"
              className="gate-contact-link"
              aria-label="Instagram"
              style={{ "--contact-index": 2 }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
              </svg>
            </a>
            <a
              href="https://wa.me/971509320937"
              target="_blank"
              rel="noreferrer"
              className="gate-contact-link"
              aria-label="WhatsApp"
              style={{ "--contact-index": 3 }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23-1.48 0-2.93-.39-4.19-1.15l-.3-.17-3.12.82.83-3.04-.2-.32a8.188 8.188 0 0 1-1.26-4.38c.01-4.54 3.7-8.24 8.25-8.24M8.53 7.33c-.16 0-.43.06-.66.31-.22.25-.87.86-.87 2.07 0 1.22.89 2.39 1 2.56.14.17 1.76 2.67 4.25 3.73.59.27 1.05.42 1.41.53.59.19 1.13.16 1.56.1.48-.07 1.46-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.07-.1-.23-.16-.48-.27-.25-.14-1.47-.74-1.69-.82-.23-.08-.37-.12-.56.12-.16.25-.64.81-.78.97-.15.17-.29.19-.53.07-.26-.13-1.06-.39-2-1.23-.74-.66-1.23-1.47-1.38-1.72-.12-.24-.01-.39.11-.5.11-.11.27-.29.37-.44.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.11-.56-1.35-.77-1.84-.2-.48-.4-.42-.56-.43-.14 0-.3-.01-.47-.01z" />
              </svg>
            </a>
          </div>
        )}
      </div>
      <div className={`gate-cursor-dot-shell${hintReady ? " is-ready" : ""}`}>
        <div ref={cursorDotRef} className="gate-cursor-dot" />
      </div>
      <div
        className={`gate-cursor-layer${hintReady && hintGuideReady ? " is-ready" : ""}${hintHidden ? " is-hidden" : ""}`}
        aria-hidden="true"
      >
        <svg className="gate-cursor-line">
          <circle ref={cursorCircleRef} className="gate-cursor-debug-circle" r="60" />
          <path ref={hintLineRef} />
          <circle ref={hintDotRef} className="gate-cursor-end-dot" r="3.5" />
        </svg>
        <div ref={hintRef} className="gate-cursor-hint">
          <span>Click to see</span>
          <span>projects</span>
        </div>
      </div>
      <div className="gate-name-anim">
        <div className="gate-name-anim-frame">
          <GateNameAnimation
            sequenceStartMs={CARDS_DELAY_MS}
            onLoaded={() => setAnimLoading(false)}
            onSequenceStart={() => setSequenceActive(true)}
          />
          <Link
            ref={whoRef}
            to="/about"
            className={`gate-who${showWho ? " gate-who-visible" : ""}${whoAnimate ? " gate-who-animate" : ""}`}
          >
            <span className="gate-who-default">Who?</span>
            <span className="gate-who-hover">Learn about me</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
