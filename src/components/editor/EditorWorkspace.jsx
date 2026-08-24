import React, { useState, useRef, useEffect, useCallback } from "react";
import EditorPreview from "./EditorPreview.jsx";
import EditorInspector from "./EditorInspector.jsx";

const VIEWS = [
  { id: "overview", label: "Overview", hint: "All pages at a glance" },
  { id: "home", label: "Home Gate", hint: "/" },
  { id: "motion", label: "Motion", hint: "/motion" },
  { id: "events", label: "Events", hint: "/events" },
  { id: "site", label: "Site Info", hint: "Global" },
];

const INSPECTOR_WIDTH_KEY = "ed-inspector-width";
const MIN_INSPECTOR_WIDTH = 280;
const MAX_INSPECTOR_WIDTH = 1000;
const DEFAULT_INSPECTOR_WIDTH = 360;

function clampInspectorWidth(width) {
  return Math.min(MAX_INSPECTOR_WIDTH, Math.max(MIN_INSPECTOR_WIDTH, width));
}

function readStoredInspectorWidth() {
  try {
    const saved = localStorage.getItem(INSPECTOR_WIDTH_KEY);
    if (saved) return clampInspectorWidth(Number(saved));
  } catch {
    /* ignore */
  }
  return DEFAULT_INSPECTOR_WIDTH;
}

export default function EditorWorkspace(props) {
  const {
    view,
    setView,
    selection,
    setSelection,
    siteInfo,
    projects,
    headerActions,
    addMotionProject,
    addProject,
  } = props;

  const bodyRef = useRef(null);
  const [inspectorWidth, setInspectorWidth] = useState(readStoredInspectorWidth);
  const [isResizing, setIsResizing] = useState(false);
  const [isWideLayout, setIsWideLayout] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(min-width: 901px)").matches,
  );
  const [navWidth, setNavWidth] = useState(200);

  useEffect(() => {
    const wideMq = window.matchMedia("(min-width: 901px)");
    const narrowNavMq = window.matchMedia("(max-width: 1100px)");
    const updateLayout = () => {
      setIsWideLayout(wideMq.matches);
      setNavWidth(narrowNavMq.matches ? 180 : 200);
    };
    updateLayout();
    wideMq.addEventListener("change", updateLayout);
    narrowNavMq.addEventListener("change", updateLayout);
    return () => {
      wideMq.removeEventListener("change", updateLayout);
      narrowNavMq.removeEventListener("change", updateLayout);
    };
  }, []);

  const handleSelect = (sel, nextView) => {
    if (nextView) setView(nextView);
    setSelection(sel);
  };

  const handleViewChange = (nextView) => {
    setView(nextView);
    if (nextView === "site") {
      setSelection({ type: "site" });
    } else if (nextView === "overview") {
      setSelection(null);
    } else {
      setSelection(null);
    }
  };

  const startResize = useCallback((event) => {
    event.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    if (!isResizing) return undefined;

    const onMouseMove = (event) => {
      const body = bodyRef.current;
      if (!body) return;
      const rect = body.getBoundingClientRect();
      const nextWidth = clampInspectorWidth(rect.right - event.clientX);
      setInspectorWidth(nextWidth);
    };

    const onMouseUp = () => {
      setIsResizing(false);
      setInspectorWidth((current) => {
        try {
          localStorage.setItem(INSPECTOR_WIDTH_KEY, String(current));
        } catch {
          /* ignore */
        }
        return current;
      });
    };

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [isResizing]);

  return (
    <div className="editor-page ed-workspace">
      <header className="ed-header">
        <div className="ed-header-title">
          <h1>Content Editor</h1>
          <p>Click anything in the preview to edit it</p>
        </div>
        <div className="ed-header-actions">{headerActions}</div>
      </header>

      <div
        ref={bodyRef}
        className={`ed-body${isResizing ? " is-resizing-inspector" : ""}`}
        style={
          isWideLayout
            ? { gridTemplateColumns: `${navWidth}px 1fr ${inspectorWidth}px` }
            : undefined
        }
      >
        <nav className="ed-nav" aria-label="Editor sections">
          {VIEWS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`ed-nav-item${view === item.id ? " is-active" : ""}`}
              onClick={() => handleViewChange(item.id)}
            >
              <span className="ed-nav-label">{item.label}</span>
              <span className="ed-nav-hint">{item.hint}</span>
            </button>
          ))}
        </nav>

        <div className="ed-preview-pane">
          <div className="ed-preview-toolbar">
            <span className="ed-preview-title">
              {VIEWS.find((v) => v.id === view)?.label || "Preview"}
            </span>
            <div className="ed-preview-toolbar-actions">
              {view === "motion" && (
                <button type="button" className="ed-btn ed-btn-small" onClick={addMotionProject}>
                  + Motion project
                </button>
              )}
              {view === "events" && (
                <button type="button" className="ed-btn ed-btn-small" onClick={addProject}>
                  + Event project
                </button>
              )}
            </div>
          </div>
          <div className="ed-preview-scroll">
            <EditorPreview
              view={view}
              siteInfo={siteInfo}
              projects={projects}
              selection={selection}
              onSelect={handleSelect}
            />
          </div>
        </div>

        <div className="ed-inspector-wrap">
          {isWideLayout && (
            <div
              className={`ed-inspector-resize-handle${isResizing ? " is-dragging" : ""}`}
              role="separator"
              aria-orientation="vertical"
              aria-label="Resize inspector panel"
              aria-valuemin={MIN_INSPECTOR_WIDTH}
              aria-valuemax={MAX_INSPECTOR_WIDTH}
              aria-valuenow={inspectorWidth}
              onMouseDown={startResize}
            />
          )}
          <EditorInspector
            {...props}
            onClose={selection ? () => setSelection(null) : undefined}
          />
        </div>
      </div>
    </div>
  );
}
