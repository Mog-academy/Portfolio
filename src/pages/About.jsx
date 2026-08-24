import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useProjects } from "../context/ProjectsContext.jsx";
import GateTopNav from "../components/GateTopNav.jsx";
import GateSignoffContact from "../components/GateSignoffContact.jsx";

const STORY = [
  {
    type: "paragraphs",
    blocks: [
      <>And it's painfully obvious.</>,
      <>
        I move between architecture, 3D visualization, motion, and teaching, not because I couldn't
        pick one, but because the question I actually care about doesn't live inside any single
        discipline: <strong>What's the essence of human communication?</strong> That's what I chase,
        whatever the medium.
      </>,
      <>
        Give me a message you need conveyed and I'll go find whatever skill it needs. That's just how
        I'm wired: I see something I can't do yet, and I can't rest until I can. It's been that way
        since I was 13, teaching myself design because a "cool" thing I saw made me need to know how
        it worked. Every skill since (3D, motion graphics, architecture, archviz, teaching, web
        development) showed up the same way: not planned, just chased down.
      </>,
    ],
  },
  {
    type: "quote",
    text: "I have no special talent. I am only passionately curious.",
    cite: "Albert Einstein",
  },
  {
    type: "paragraphs",
    blocks: [
      <>
        Today that means I'm an architect who thinks like a visualizer, a designer who thinks like a
        director, and a teacher who still can't stand watching people struggle with something I
        already figured out.{" "}
        <a
          href="https://www.mog-academy.com"
          target="_blank"
          rel="noreferrer"
          className="about-brand-link"
        >
          Mo.G Academy
        </a>{" "}
        exists because of that last part: I'd rather hand someone
        the shortcut than watch them take the long way.
      </>,
      <>
        I don't collect tools for the sake of it. I care about the idea behind them, and I'm not
        precious about throwing out a method the moment I find a better one.
      </>,
    ],
  },
  {
    type: "quote",
    text: "Good design is as little design as possible.",
    cite: "Dieter Rams",
  },
  {
    type: "paragraphs",
    blocks: [
      <>
        For me that's not about minimalism, it's about intention. Every element has to earn its
        place, every decision has to move the idea forward, and I don't add what doesn't.
      </>,
      <>
        That's the whole approach, really: stay curious enough to keep learning, disciplined enough
        to know what to cut, and stubborn enough to make sure the work actually says something.
      </>,
    ],
  },
];

export default function About() {
  const { data, loading } = useProjects();
  const contact = data?.SITE?.contact;

  useEffect(() => {
    document.body.classList.add("gate-active");
    return () => document.body.classList.remove("gate-active");
  }, []);

  return (
    <div className="gate about-page">
      <div className="gate-inner about-inner">
        <GateTopNav />
        <h1 className="gate-name">
          <Link to="/" className="gate-name-link">
            Mohamed Elgaili
          </Link>
        </h1>
        <p className="gate-subtitle">Multidisciplinary Creative</p>

        <article className="about-story">
          <header className="about-intro">
            <span className="about-eyebrow">Introduction</span>
            <h2 className="about-headline">I don't believe in staying in one lane.</h2>
          </header>

          <div className="about-portrait">
            <img
              src="/gate/about-portrait.png"
              alt="Mohamed Elgaili"
              className="about-portrait-img"
            />
          </div>

          {STORY.map((section, i) => {
            if (section.type === "quote") {
              return (
                <blockquote key={i} className="about-quote">
                  <span className="about-quote-rule about-quote-rule-top" aria-hidden="true" />
                  <p className="about-quote-text">"{section.text}"</p>
                  <cite className="about-quote-cite">{section.cite}</cite>
                  <span className="about-quote-rule about-quote-rule-bottom" aria-hidden="true" />
                </blockquote>
              );
            }

            return (
              <div key={i} className="about-copy">
                {section.blocks.map((block, j) => (
                  <p key={j}>{block}</p>
                ))}
              </div>
            );
          })}

          {!loading && contact && <GateSignoffContact contact={contact} />}
        </article>
      </div>
    </div>
  );
}
