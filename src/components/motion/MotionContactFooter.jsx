import React from "react";
import GateSignoffContact from "../GateSignoffContact.jsx";

export default function MotionContactFooter({ contact, preview = false }) {
  if (!contact) return null;

  return (
    <section
      id="contact"
      className={`motion-contact-section${preview ? " is-preview" : ""}`}
      aria-label="Contact"
    >
      <div className="motion-contact-inner">
        <GateSignoffContact contact={contact} />
      </div>
    </section>
  );
}
