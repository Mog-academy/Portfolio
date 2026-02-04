import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

export default function ProjectCard({ project, index, isCentered, onCenterChange }) {
  const cardRef = useRef(null);
  const videoRef = useRef(null);
  const [showVideo, setShowVideo] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const checkIfCentered = () => {
      if (!cardRef.current) return;

      const rect = cardRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const cardCenter = rect.top + rect.height / 2;
      const screenCenter = windowHeight / 2;
      
      // Check if card center is close to screen center (within 20% of screen height)
      const threshold = windowHeight * 0.2;
      const distanceFromCenter = Math.abs(cardCenter - screenCenter);
      
      if (distanceFromCenter < threshold && rect.top < windowHeight && rect.bottom > 0) {
        onCenterChange(index);
      }
    };

    // Only add scroll listener on mobile
    if (window.innerWidth <= 900) {
      checkIfCentered();
      window.addEventListener('scroll', checkIfCentered);
      window.addEventListener('resize', checkIfCentered);

      return () => {
        window.removeEventListener('scroll', checkIfCentered);
        window.removeEventListener('resize', checkIfCentered);
      };
    }
  }, [index, onCenterChange]);

  // Find first video from gallery if hoverVideo not set
  const getHoverVideo = () => {
    if (project.hoverVideo) return project.hoverVideo;
    
    // Look through all sections' galleries for first video
    if (project.sections) {
      for (const section of project.sections) {
        if (section.gallery) {
          const video = section.gallery.find(url => /\.(mp4|webm|ogg|mov)$/i.test(url));
          if (video) return video;
        }
      }
    }
    return null;
  };

  const hoverVideo = getHoverVideo();

  // Handle video display on desktop hover or mobile center
  useEffect(() => {
    const isMobile = window.innerWidth <= 900;
    const shouldShowVideo = isMobile ? isCentered : isHovered;
    
    if (shouldShowVideo && hoverVideo) {
      setShowVideo(true);
      // Play video when shown
      if (videoRef.current) {
        videoRef.current.play().catch(err => console.log('Video play failed:', err));
      }
    } else {
      setShowVideo(false);
      // Pause video when hidden
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  }, [isCentered, isHovered, hoverVideo]);

  return (
    <Link 
      ref={cardRef}
      to={`/project/${project.slug}`} 
      className={`card ${isCentered ? 'mobile-visible' : ''}`}
      aria-label={`${project.brand} project`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="card-media">
        <img 
          src={project.cover.src} 
          alt={project.cover.alt} 
          loading="lazy"
          style={{ display: showVideo ? 'none' : 'block' }}
        />
        {hoverVideo && (
          <video
            ref={videoRef}
            src={hoverVideo}
            alt={project.cover.alt}
            muted
            loop
            playsInline
            style={{ 
              display: showVideo ? 'block' : 'none',
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        )}
        <div className="card-overlay">
          <div className="card-title">{project.title}</div>
        </div>
      </div>
    </Link>
  );
}
