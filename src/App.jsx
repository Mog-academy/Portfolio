import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { ProjectsProvider } from "./context/ProjectsContext.jsx";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import SocialBar from "./components/SocialBar.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import PasswordProtect from "./components/PasswordProtect.jsx";
import Gate from "./pages/Gate.jsx";
import About from "./pages/About.jsx";
import Home from "./pages/Home.jsx";
import Motion from "./pages/Motion.jsx";
import Project from "./pages/Project.jsx";
import Philosophy from "./pages/Philosophy.jsx";
import NotFound from "./pages/NotFound.jsx";
import ProjectEditor from "./pages/ProjectEditor.jsx";

function PortfolioLayout() {
  const location = useLocation();
  const isEditor = location.pathname === "/editing";

  return (
    <div className={`app-shell layout${isEditor ? " layout-editor" : ""}`}>
      {!isEditor && (
        <aside className="sidebar">
          <Navbar />
        </aside>
      )}

      <main className="app-main content-area">
        {!isEditor && <SocialBar />}
        <Routes>
          <Route path="/events" element={<Home />} />
          <Route path="/philosophy" element={<Philosophy />} />
          <Route path="/editing" element={<PasswordProtect><ProjectEditor /></PasswordProtect>} />
          <Route path="/project/:slug" element={<Project />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        {!isEditor && <Footer />}
      </main>
    </div>
  );
}

function AppRoutes() {
  const location = useLocation();
  const isStandalone =
    location.pathname === "/" ||
    location.pathname === "/about" ||
    location.pathname === "/motion";

  return (
    <>
      <ScrollToTop />
      {isStandalone ? (
        <Routes>
          <Route path="/" element={<Gate />} />
          <Route path="/about" element={<About />} />
          <Route path="/motion" element={<Motion />} />
        </Routes>
      ) : (
        <PortfolioLayout />
      )}
    </>
  );
}

export default function App() {
  return (
    <ProjectsProvider>
      <AppRoutes />
    </ProjectsProvider>
  );
}
