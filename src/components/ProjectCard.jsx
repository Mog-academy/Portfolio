import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

export default function ProjectCard({ project }) {
  const cardRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show title when card is at least 50% visible
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      },
      {
        threshold: [0.5], // Trigger when 50% visible
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  return (
    <Link 
      ref={cardRef}
      to={`/project/${project.slug}`} 
      className={`card ${isVisible ? 'mobile-visible' : ''}`}
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
