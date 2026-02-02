import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getProjectBySlug } from "../data/projects.js";
import Section from "../components/Section.jsx";

function Paragraphs({ text }) {
  // Split on blank lines for readability
  const chunks = String(text || "").split("\n\n").map((t) => t.trim()).filter(Boolean);
  return (
    <>
      {chunks.map((p, idx) => (
        <p className="p" key={idx}>
          {p}
        </p>
      ))}
    </>
  );
}

// Gallery component with responsive grid based on image count
function SectionGallery({ images, brand, onImageClick }) {
  if (!images || images.length === 0) return null;
  
  // Helper to determine if the media is a video
  const isVideo = (url) => {
    return url.startsWith('data:video/') || /\.(mp4|webm|ogg|mov)$/i.test(url);
  };
  
  // Determine grid layout based on number of images
  const getGridClass = (count) => {
    if (count === 1) return "section-gallery-single";
    if (count === 2) return "section-gallery-two";
    if (count === 3) return "section-gallery-three";
    if (count === 4) return "section-gallery-grid";
    return "section-gallery-horizontal"; // 5+ images - horizontal layout
  };

  return (
    <div className={`section-gallery-container ${getGridClass(images.length)}`}>
      {images.map((src, i) => {
        const isVid = isVideo(src);
        return (
          <div 
            key={i} 
            className="section-gallery-item" 
            onClick={() => onImageClick({ url: src, isVideo: isVid })}
            style={{ cursor: 'pointer' }}
          >
            {isVid ? (
              <video 
                src={src} 
                autoPlay 
                loop 
                muted 
                playsInline
                loading="lazy"
              />
            ) : (
              <img 
                src={src} 
                alt={`${brand} - ${i + 1}`} 
                loading="lazy" 
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function Project() {
  const { slug } = useParams();
  const project = getProjectBySlug(slug);
  const [lightboxMedia, setLightboxMedia] = useState(null);

  if (!project) {
    return (
      <div className="container">
        <div className="project-top">
          <h1 className="project-title">Project not found</h1>
          <Link className="back" to="/">Back to work</Link>
        </div>
      </div>
    );
  }

  const sections = project.customSections || project.sections || [];

  return (
    <div className="container">
      {/* Lightbox Modal */}
      {lightboxMedia && (
        <div className="lightbox-overlay" onClick={() => setLightboxMedia(null)}>
          <button className="lightbox-close" onClick={() => setLightboxMedia(null)}>×</button>
          {lightboxMedia.isVideo ? (
            <video 
              src={lightboxMedia.url} 
              className="lightbox-image"
              controls
              autoPlay
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <img 
              src={lightboxMedia.url} 
              alt="Full view" 
              className="lightbox-image"
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>
      )}

      <div className="project-top">
        <Link className="back-btn" to="/">← Back to Projects</Link>
      </div>

      <header className="project-hero">
        <div className="project-hero-media">
          <img src={project.cover.src} alt={project.cover.alt} />
          <div className="project-hero-overlay">
            <h1 className="project-title">{project.title}</h1>
            <p className="project-subtitle">{project.subtitle}</p>
          </div>
        </div>
      </header>

      <div className="project-body">
        {sections.map((s, idx) => {
          const hasGallery = s.gallery && s.gallery.length > 0;
          const hasLargeGallery = hasGallery && s.gallery.length > 4;
          const useFullWidth = !hasGallery || hasLargeGallery;
          
          return (
            <div key={s.heading} className="project-section-wrapper">
              <Section title={s.heading}>
                {useFullWidth ? (
                  // Full-width layout for no images or 5+ images
                  <div className="section-full-layout">
                    <div className="section-text-full">
                      <Paragraphs text={s.body} />
                    </div>
                    {hasGallery && (
                      <div className="section-gallery-full">
                        <SectionGallery 
                          images={s.gallery} 
                          brand={project.brand}
                          onImageClick={setLightboxMedia}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  // Side-by-side layout for 1-4 images
                  <div className="section-split-layout">
                    <div className="section-text-column">
                      <Paragraphs text={s.body} />
                    </div>
                    
                    <div className="section-gallery-column">
                      <SectionGallery 
                        images={s.gallery} 
                        brand={project.brand}
                        onImageClick={setLightboxMedia}
                      />
                    </div>
                  </div>
                )}
              </Section>
            </div>
          );
        })}
      </div>
    </div>
  );
}
