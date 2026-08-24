import React from "react";
import { NavLink } from "react-router-dom";

const NAV_ITEMS = [
  { label: "Home", to: "/", end: true },
  { label: "Motion Design", to: "/motion" },
  { label: "Event Design", to: "/events" },
  { label: "Architectural Visualization", to: "https://mog-renders.com", external: true },
  { label: "My Academy", to: "https://www.mog-academy.com", external: true },
];

export default function GateTopNav() {
  return (
    <header className="gate-topnav">
      <nav className="gate-topnav-inner" aria-label="Site">
        {NAV_ITEMS.map((item) =>
          item.external ? (
            <a
              key={item.label}
              href={item.to}
              target="_blank"
              rel="noreferrer"
              className="gate-topnav-link"
            >
              {item.label}
            </a>
          ) : (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `gate-topnav-link${isActive ? " gate-topnav-link-active" : ""}`
              }
            >
              {item.label}
            </NavLink>
          ),
        )}
      </nav>
    </header>
  );
}
