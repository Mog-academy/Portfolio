import React, { useEffect, useRef, useState } from "react";

const QUALITIES = ["Rhythm", "Emotion", "Tension", "Anticipation", "Personality"];

export default function MotionEssenceSection({ preview = false }) {
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
      id="about"
      ref={sectionRef}
      className={`motion-about motion-essence${visible ? " is-visible" : ""}${preview ? " is-preview" : ""}`}
      aria-labelledby="motion-about-heading"
    >
      <div className="motion-about-glow" aria-hidden="true" />
      <div className="motion-about-inner">
        <span className="motion-section-label motion-about-label">About</span>

        <div className="motion-about-lead">
          <h2 id="motion-about-heading" className="motion-about-question">
            What&apos;s the essence of <span>human communication</span>?
          </h2>
          <p className="motion-about-kicker">
            For me, motion design is an exploration of that bigger question.
          </p>
        </div>

        <ul className="motion-about-qualities" aria-label="What motion adds to ideas">
          {QUALITIES.map((word, index) => (
            <li
              key={word}
              className="motion-about-quality"
              style={{ "--quality-index": index }}
            >
              {word}
            </li>
          ))}
        </ul>

        <div className="motion-essence-copy">
          <p className="motion-about-highlight">
            Motion gives ideas something words alone cannot always give them.
          </p>
          <p>
            I think about how a visual should <em>feel</em> before I think about how it should
            be made. I enjoy unexpected transitions, expressive timing, and finding simple
            visual ways to communicate something complex.
          </p>
          <p>
            My taste leans toward work that feels intentional and human, where every movement
            has a reason and nothing exists simply for spectacle.
          </p>
        </div>

        <blockquote className="motion-about-closer">
          <span className="motion-about-closer-label">The question remains</span>
          <p>
            The technology changes constantly, but the question remains the same: how can movement
            make someone feel, understand, or connect with an idea?
          </p>
        </blockquote>
      </div>
    </section>
  );
}
