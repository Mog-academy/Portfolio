import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

export default function ProjectCard({ project, index, isCentered, onCenterChange }) {
  const cardRef = useRef(null);

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

  return (
    <Link 
      ref={cardRef}
      to={`/project/${project.slug}`} 
      className={`card ${isCentered ? 'mobile-visible' : ''}`}
      aria-label={`${project.brand} project`}
    >
      <div className="card-media">
        <img src={project.cover.src} alt={project.cover.alt} loading="lazy" />
        <div className="card-overlay">
          <div className="card-title">{project.title}</div>
        </div>
      </div>
    </Link>
  );
}
