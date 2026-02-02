import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import SocialBar from "./components/SocialBar.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import PasswordProtect from "./components/PasswordProtect.jsx";
import Home from "./pages/Home.jsx";
import Project from "./pages/Project.jsx";
import Philosophy from "./pages/Philosophy.jsx";
import NotFound from "./pages/NotFound.jsx";
import ProjectEditor from "./pages/ProjectEditor.jsx";

export default function App() {
  return (
    <div className="app-shell layout">
      <ScrollToTop />
      <aside className="sidebar">
        <Navbar />
      </aside>

      <main className="app-main content-area">
        <SocialBar />
        <Routes>
          <Route path="/" element={<Home />} />
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
