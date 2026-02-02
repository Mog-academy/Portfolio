import React from "react";
import Section from "../components/Section.jsx";

export default function Philosophy() {
  return (
    <div className="container">
      <header className="hero hero-tight">
        <h1 className="hero-title">My Philosophy</h1>
        <p className="hero-text">
          I turn ideas into moments that people remember, where creativity meets emotion at every
          turn. Every space I craft tells a story, sparks delight, and leaves a lasting impression.
        </p>
      </header>

      <Section title="A story of how I design">
        <img src="/project_images/1770064955891-0zui0iupy.jpeg" alt="Design work" className="philosophy-image" />
        <p className="p">
          I began my journey in design over a decade ago, drawn to the power of space to shape how
          people feel and interact with the world. From luxury brand launches in Dubai to intimate
          workshops across the Middle East, I’ve discovered that every project is a story waiting to
          be told. It starts with listening — to the brand, the audience, and the context — and
          immersing myself in their world until I understand what they want people to feel, see, and
          remember.
        </p>
        <p className="p">
          From that understanding, I craft experiences where every detail matters. Light, texture,
            proportion, layout, and interactive moments are never accidental — they are tools to guide
            perception and evoke emotion. Creativity is my tool to spark delight and create moments
            that linger in memory. Then comes execution: transforming renders and technical drawings
            into reality, coordinating suppliers, solving problems, and ensuring that even the boldest
            ideas are realized flawlessly.
        </p>
        <p className="p">
          Along the way, I lead by example, guiding teams while empowering them to bring their best
          work forward. Constraints like budgets, timelines, or technical limits aren’t obstacles;
          they’re opportunities to innovate. My goal is always the same: to bridge imagination with
          reality, and craft immersive experiences that inspire, engage, and leave a lasting mark.
        </p>
      </Section>

      <Section title="The deeper philosophy">
        <p className="p">
          True design exists beyond mere form or function; it is the meeting point of intention,
          experience, and meaning. Every act of creation carries with it a responsibility — to
          awaken perception, to provoke thought, and to engage the human spirit.
        </p>
        <p className="p">
          The essence of meaningful creation lies in harmonizing the tangible and intangible.
          Material form becomes a language: light, texture, proportion, and rhythm orchestrate an
          experience, guiding attention and creating resonance. Design, at its highest, gives form
          to invisible currents — offering space for contemplation, introspection, and wonder.
        </p>
        <p className="p">
          Creation is relational. It connects past, present, and future. True design invites
          participation; it asks people to pause, to sense, and to reflect. Each creation leaves a
          trace — not just in space, but in thought and memory — resonating long after the first
          encounter.
        </p>
      </Section>
    </div>
  );
}
