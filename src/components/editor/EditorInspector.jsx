import React from "react";
import MediaField from "./MediaField.jsx";

function InspectorShell({ title, subtitle, onClose, onDelete, children }) {
  return (
    <div className="ed-inspector">
      <div className="ed-inspector-head">
        <div>
          <h3>{title}</h3>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <div className="ed-inspector-actions">
          {onDelete && (
            <button type="button" className="ed-btn ed-btn-danger" onClick={onDelete}>
              Delete
            </button>
          )}
          {onClose && (
            <button type="button" className="ed-btn ed-btn-ghost" onClick={onClose} aria-label="Close">
              ×
            </button>
          )}
        </div>
      </div>
      <div className="ed-inspector-body">{children}</div>
    </div>
  );
}

function TextField({ label, value, onChange, multiline, rows = 3 }) {
  return (
    <label className="ed-field">
      <span className="ed-field-label">{label}</span>
      {multiline ? (
        <textarea rows={rows} value={value || ""} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input type="text" value={value || ""} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  );
}

export default function EditorInspector({
  selection,
  view,
  siteInfo,
  projects,
  onClose,
  updateSiteInfo,
  updateGateItem,
  updateGateFile,
  updateMotionHero,
  updateMotionHeroFile,
  updateMotionItem,
  updateMotionTools,
  updateMotionFile,
  updateMotionToolItem,
  updateMotionToolFile,
  addMotionProject,
  deleteMotionProject,
  updateProject,
  updateSection,
  addSection,
  deleteSection,
  updateProjectCover,
  addGalleryImageFile,
  removeGalleryImage,
  addProject,
  deleteProject,
}) {
  if (view === "site" || selection?.type === "site") {
    return (
      <InspectorShell title="Site information" subtitle="Used across portfolio pages">
        <TextField label="Name" value={siteInfo.name} onChange={(v) => updateSiteInfo("name", v)} />
        <TextField label="Role" value={siteInfo.role} onChange={(v) => updateSiteInfo("role", v)} />
        <TextField label="Location" value={siteInfo.location} onChange={(v) => updateSiteInfo("location", v)} />
        <TextField label="Headline" value={siteInfo.headline} onChange={(v) => updateSiteInfo("headline", v)} />
        <TextField label="Intro" value={siteInfo.intro} onChange={(v) => updateSiteInfo("intro", v)} multiline rows={4} />
      </InspectorShell>
    );
  }

  if (!selection) {
    return (
      <div className="ed-inspector ed-inspector-empty">
        <h3>Select something to edit</h3>
        <p>Click a tile, card, or project in the preview to edit its content and media.</p>
        {view === "motion" && (
          <button type="button" className="ed-btn ed-btn-secondary" onClick={addMotionProject}>
            + Add motion project
          </button>
        )}
        {view === "events" && (
          <button type="button" className="ed-btn ed-btn-secondary" onClick={addProject}>
            + Add event project
          </button>
        )}
      </div>
    );
  }

  if (selection.type === "gate") {
    const dest = siteInfo.gate[selection.index];
    if (!dest) return null;
    return (
      <InspectorShell title={dest.label} subtitle="Home gate destination tile">
        <MediaField
          label="Tile image"
          accept="image/*"
          value={dest.image}
          onFile={(file) => updateGateFile(selection.index, "image", file)}
        />
        <MediaField
          label="Hover video"
          accept="video/*"
          kind="video"
          value={dest.video}
          onFile={(file) => updateGateFile(selection.index, "video", file)}
        />
        <label className="ed-check">
          <input
            type="checkbox"
            checked={!!dest.logo}
            onChange={(e) => updateGateItem(selection.index, "logo", e.target.checked)}
          />
          Logo tile (white background, contain)
        </label>
      </InspectorShell>
    );
  }

  if (selection.type === "motion-hero") {
    return (
      <InspectorShell title="Motion hero" subtitle="Background video on /motion">
        <MediaField
          label="Hero video"
          accept="video/*"
          kind="video"
          value={siteInfo.motionHero?.video}
          onFile={(file) => updateMotionHeroFile("video", file)}
        />
        <MediaField
          label="Poster image"
          accept="image/*"
          value={siteInfo.motionHero?.poster}
          onFile={(file) => updateMotionHeroFile("poster", file)}
        />
      </InspectorShell>
    );
  }

  if (selection.type === "motion-tool") {
    const item = siteInfo.motionTools?.[selection.index];
    if (!item) return null;
    return (
      <InspectorShell title={item.name || "Toolkit item"} subtitle="Software card on /motion">
        <TextField
          label="Name"
          value={item.name}
          onChange={(v) => updateMotionToolItem(selection.index, "name", v)}
        />
        <MediaField
          label="Hover video"
          accept="video/*"
          kind="video"
          value={item.video}
          onFile={(file) => updateMotionToolFile(selection.index, "video", file)}
        />
      </InspectorShell>
    );
  }

  if (selection.type === "motion") {
    const item = siteInfo.motion[selection.index];
    if (!item) return null;
    return (
      <InspectorShell
        title={item.title || "Motion project"}
        subtitle="Motion page project card"
        onDelete={() => {
          if (window.confirm("Delete this motion project?")) deleteMotionProject(selection.index);
        }}
      >
        <TextField label="Title" value={item.title} onChange={(v) => updateMotionItem(selection.index, "title", v)} />
        <TextField label="Subtitle" value={item.subtitle} onChange={(v) => updateMotionItem(selection.index, "subtitle", v)} />
        <TextField
          label="Description"
          value={item.description}
          onChange={(v) => updateMotionItem(selection.index, "description", v)}
          multiline
          rows={4}
        />
        <TextField label="Category" value={item.category} onChange={(v) => updateMotionItem(selection.index, "category", v)} />
        <TextField label="Year" value={item.year} onChange={(v) => updateMotionItem(selection.index, "year", v)} />
        <TextField
          label="Tools"
          value={(item.tools || []).join(", ")}
          onChange={(v) => updateMotionTools(selection.index, v)}
        />
        <MediaField
          label="Card image"
          accept="image/*"
          value={item.image}
          onFile={(file) => updateMotionFile(selection.index, "image", file)}
        />
        <MediaField
          label="Card / modal video"
          accept="video/*"
          kind="video"
          value={item.video}
          onFile={(file) => updateMotionFile(selection.index, "video", file)}
        />
      </InspectorShell>
    );
  }

  if (selection.type === "event") {
    const project = projects[selection.index];
    if (!project) return null;
    const videoOptions =
      project.sections?.flatMap(
        (section) => section.gallery?.filter((url) => /\.(mp4|webm|ogg|mov)$/i.test(url)) || [],
      ) || [];

    return (
      <InspectorShell
        title={project.brand || project.title}
        subtitle={`Event project · /project/${project.slug}`}
        onDelete={() => {
          if (window.confirm("Delete this project?")) deleteProject(selection.index);
        }}
      >
        <TextField label="Brand" value={project.brand} onChange={(v) => updateProject(selection.index, "brand", v)} />
        <TextField label="Title" value={project.title} onChange={(v) => updateProject(selection.index, "title", v)} />
        <TextField label="Slug" value={project.slug} onChange={(v) => updateProject(selection.index, "slug", v)} />
        <TextField
          label="Subtitle"
          value={project.subtitle}
          onChange={(v) => updateProject(selection.index, "subtitle", v)}
          multiline
          rows={2}
        />
        <MediaField
          label="Cover image"
          accept="image/*,video/*"
          value={project.cover?.src}
          onFile={(file) => updateProjectCover(selection.index, file)}
        />
        <TextField
          label="Cover alt text"
          value={project.cover?.alt}
          onChange={(v) => {
            const cover = { ...project.cover, alt: v };
            updateProject(selection.index, "cover", cover);
          }}
        />
        <label className="ed-field">
          <span className="ed-field-label">Hover video</span>
          <select
            value={project.hoverVideo || ""}
            onChange={(e) => updateProject(selection.index, "hoverVideo", e.target.value)}
          >
            <option value="">Use first gallery video</option>
            {videoOptions.map((video, idx) => (
              <option key={idx} value={video}>
                {video.split("/").pop()}
              </option>
            ))}
          </select>
        </label>
        <TextField
          label="Tags"
          value={project.tags?.join(", ") || ""}
          onChange={(v) =>
            updateProject(
              selection.index,
              "tags",
              v.split(",").map((t) => t.trim()).filter(Boolean),
            )
          }
        />

        <div className="ed-sections">
          <div className="ed-sections-head">
            <span className="ed-field-label">Page sections</span>
            <button type="button" className="ed-btn ed-btn-small" onClick={() => addSection(selection.index)}>
              + Add section
            </button>
          </div>
          {project.sections?.map((section, sIndex) => (
            <div key={sIndex} className="ed-section-card">
              <div className="ed-section-card-head">
                <strong>Section {sIndex + 1}</strong>
                <button
                  type="button"
                  className="ed-btn ed-btn-danger ed-btn-small"
                  onClick={() => {
                    if (window.confirm("Delete this section?")) deleteSection(selection.index, sIndex);
                  }}
                >
                  Delete
                </button>
              </div>
              <TextField
                label="Heading"
                value={section.heading}
                onChange={(v) => updateSection(selection.index, sIndex, "heading", v)}
              />
              <TextField
                label="Body"
                value={section.body}
                onChange={(v) => updateSection(selection.index, sIndex, "body", v)}
                multiline
                rows={5}
              />
              <span className="ed-field-label">Gallery</span>
              <div className="ed-gallery">
                {section.gallery?.map((url, imgIndex) => {
                  const isVideo = url.startsWith("data:video/") || /\.(mp4|webm|ogg|mov)$/i.test(url);
                  return (
                    <div key={imgIndex} className="ed-gallery-item">
                      {isVideo ? <video src={url} muted loop autoPlay playsInline /> : <img src={url} alt="" />}
                      <button
                        type="button"
                        className="ed-gallery-remove"
                        onClick={() => removeGalleryImage(selection.index, sIndex, imgIndex)}
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
                <label className="ed-gallery-add">
                  + Media
                  <input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    className="ed-upload-input"
                    onChange={(e) => {
                      if (e.target.files?.length) {
                        addGalleryImageFile(selection.index, sIndex, e.target.files);
                        e.target.value = "";
                      }
                    }}
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
      </InspectorShell>
    );
  }

  return null;
}
