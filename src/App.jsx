import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { ProjectsProvider } from "./context/ProjectsContext.jsx";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import SocialBar from "./components/SocialBar.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import PasswordProtect from "./components/PasswordProtect.jsx";
import Gate from "./pages/Gate.jsx";
import Home from "./pages/Home.jsx";
import Motion from "./pages/Motion.jsx";
import Project from "./pages/Project.jsx";
import Philosophy from "./pages/Philosophy.jsx";
import NotFound from "./pages/NotFound.jsx";
import ProjectEditor from "./pages/ProjectEditor.jsx";

function PortfolioLayout() {
  return (
    <div className="app-shell layout">
      <aside className="sidebar">
        <Navbar />
      </aside>

      <main className="app-main content-area">
        <SocialBar />
        <Routes>
          <Route path="/events" element={<Home />} />
          <Route path="/motion" element={<Motion />} />
          <Route path="/philosophy" element={<Philosophy />} />
          <Route path="/editing" element={<PasswordProtect><ProjectEditor /></PasswordProtect>} />
          <Route path="/project/:slug" element={<Project />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </main>
    </div>
  );
}

function AppRoutes() {
  const location = useLocation();
  const isGate = location.pathname === "/";

  return (
    <>
      <ScrollToTop />
      {isGate ? (
        <Routes>
          <Route path="/" element={<Gate />} />
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
