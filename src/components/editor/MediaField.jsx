import React from "react";

export default function MediaField({ label, accept, value, kind = "image", onFile }) {
  return (
    <div className="ed-field">
      <span className="ed-field-label">{label}</span>
      {value && (
        <div className="ed-media-preview">
          {kind === "video" ? (
            <video src={value} muted loop controls playsInline />
          ) : (
            <img src={value} alt="" />
          )}
        </div>
      )}
      <label className="ed-upload-btn">
        {value ? "Replace file" : "Upload file"}
        <input
          type="file"
          accept={accept}
          className="ed-upload-input"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFile(file);
            e.target.value = "";
          }}
        />
      </label>
    </div>
  );
}
