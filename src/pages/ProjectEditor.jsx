import React, { useState, useRef, useEffect } from "react";
import { useProjects } from "../context/ProjectsContext.jsx";
import { DEFAULT_GATE } from "./Gate.jsx";
import { DEFAULT_MOTION, DEFAULT_MOTION_HERO, DEFAULT_MOTION_TOOLS } from "../data/motionDefaults.js";
import EditorWorkspace from "../components/editor/EditorWorkspace.jsx";
import { getApiBase, uploadDataUrl } from "../utils/blobUpload.js";

export default function ProjectEditor() {
  const { data, loading, refresh } = useProjects();
  const [projects, setProjects] = useState([]);
  const [siteInfo, setSiteInfo] = useState({});
  const [view, setView] = useState("overview");
  const [selection, setSelection] = useState(null);
  const processingFiles = useRef(new WeakMap());

  useEffect(() => {
    if (data) {
      setProjects(data.PROJECTS);
      setSiteInfo({
        ...data.SITE,
        gate: data.SITE?.gate?.length ? data.SITE.gate : DEFAULT_GATE.map((d) => ({ ...d })),
        motionHero: data.SITE?.motionHero || { ...DEFAULT_MOTION_HERO },
        motion: data.SITE?.motion?.length ? data.SITE.motion : DEFAULT_MOTION.map((d) => ({ ...d })),
        motionTools: data.SITE?.motionTools?.length
          ? data.SITE.motionTools
          : DEFAULT_MOTION_TOOLS.map((d) => ({ ...d })),
      });
    }
  }, [data]);

  if (loading || !data) {
    return <div className="editor-page"><p>Loading...</p></div>;
  }

  const updateSiteInfo = (field, value) => {
    setSiteInfo({ ...siteInfo, [field]: value });
  };

  const updateGateItem = (index, field, value) => {
    const gate = [...(siteInfo.gate || [])];
    gate[index] = { ...gate[index], [field]: value };
    setSiteInfo({ ...siteInfo, gate });
  };

  const updateGateFile = (index, field, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setSiteInfo((prev) => {
        const gate = [...(prev.gate || [])];
        gate[index] = { ...gate[index], [field]: e.target.result };
        return { ...prev, gate };
      });
    };
    reader.readAsDataURL(file);
  };

  const updateMotionHero = (field, value) => {
    setSiteInfo({
      ...siteInfo,
      motionHero: { ...(siteInfo.motionHero || {}), [field]: value },
    });
  };

  const updateMotionHeroFile = (field, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setSiteInfo((prev) => ({
        ...prev,
        motionHero: { ...(prev.motionHero || {}), [field]: e.target.result },
      }));
    };
    reader.readAsDataURL(file);
  };

  const updateMotionItem = (index, field, value) => {
    const motion = [...(siteInfo.motion || [])];
    motion[index] = { ...motion[index], [field]: value };
    setSiteInfo({ ...siteInfo, motion });
  };

  const updateMotionTools = (index, value) => {
    const tools = value
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    updateMotionItem(index, "tools", tools);
  };

  const updateMotionFile = (index, field, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setSiteInfo((prev) => {
        const motion = [...(prev.motion || [])];
        motion[index] = { ...motion[index], [field]: e.target.result };
        return { ...prev, motion };
      });
    };
    reader.readAsDataURL(file);
  };

  const updateMotionToolItem = (index, field, value) => {
    const motionTools = [...(siteInfo.motionTools || [])];
    motionTools[index] = { ...motionTools[index], [field]: value };
    setSiteInfo({ ...siteInfo, motionTools });
  };

  const updateMotionToolFile = (index, field, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setSiteInfo((prev) => {
        const motionTools = [...(prev.motionTools || [])];
        motionTools[index] = { ...motionTools[index], [field]: e.target.result };
        return { ...prev, motionTools };
      });
    };
    reader.readAsDataURL(file);
  };

  const addMotionProject = () => {
    const motion = [...(siteInfo.motion || [])];
    const newIndex = motion.length;
    motion.push({
      id: `motion-${Date.now()}`,
      title: "New Project",
      subtitle: "",
      description: "",
      category: "Motion Design",
      year: new Date().getFullYear().toString(),
      image: "",
      video: "",
      tools: [],
    });
    setSiteInfo({ ...siteInfo, motion });
    setView("motion");
    setSelection({ type: "motion", index: newIndex });
  };

  const deleteMotionProject = (index) => {
    const motion = [...(siteInfo.motion || [])];
    motion.splice(index, 1);
    setSiteInfo({ ...siteInfo, motion });
    setSelection((prev) => {
      if (prev?.type === "motion" && prev.index === index) return null;
      if (prev?.type === "motion" && prev.index > index) return { ...prev, index: prev.index - 1 };
      return prev;
    });
  };

  const updateProject = (index, field, value) => {
    const updated = [...projects];
    updated[index] = { ...updated[index], [field]: value };
    setProjects(updated);
  };

  const updateSection = (projectIndex, sectionIndex, field, value) => {
    const updated = [...projects];
    updated[projectIndex].sections[sectionIndex] = {
      ...updated[projectIndex].sections[sectionIndex],
      [field]: value
    };
    setProjects(updated);
  };

  const addSection = (projectIndex) => {
    const updated = [...projects];
    updated[projectIndex].sections.push({
      heading: "New Section",
      body: "",
      gallery: []
    });
    setProjects(updated);
  };

  const deleteSection = (projectIndex, sectionIndex) => {
    const updated = [...projects];
    updated[projectIndex].sections.splice(sectionIndex, 1);
    setProjects(updated);
  };

  const addGalleryImage = (projectIndex, sectionIndex, url) => {
    if (!url) return;
    const updated = [...projects];
    if (!updated[projectIndex].sections[sectionIndex].gallery) {
      updated[projectIndex].sections[sectionIndex].gallery = [];
    }
    updated[projectIndex].sections[sectionIndex].gallery.push(url);
    setProjects(updated);
  };

  const addGalleryImageFile = async (projectIndex, sectionIndex, files) => {
    if (!files || files.length === 0) return;
    
    console.log(`📁 Adding ${files.length} file(s) to preview...`);
    
    // Use WeakMap to track if this exact FileList has been processed
    if (processingFiles.current.has(files)) {
      console.log('⚠️ Skipping duplicate file processing (WeakMap detected same FileList)');
      return;
    }
    
    // Mark this FileList as being processed
    processingFiles.current.set(files, true);
    
    const filePromises = [];
    
    // Process all files - just convert to data URLs for preview
    for (const file of Array.from(files)) {
      const promise = new Promise((resolve) => {
        try {
          const reader = new FileReader();
          reader.onload = (e) => {
            const dataUrl = e.target.result;
            resolve(dataUrl);
          };
          reader.readAsDataURL(file);
        } catch (err) {
          console.error('Error reading file:', err);
          resolve(null);
        }
      });
      
      filePromises.push(promise);
    }
    
    // Wait for all files to be processed
    const results = await Promise.all(filePromises);
    const validDataUrls = results.filter(url => url !== null);
    
    // Update state with data URLs for preview
    if (validDataUrls.length > 0) {
      setProjects(prev => {
        const updated = [...prev];
        if (!updated[projectIndex].sections[sectionIndex].gallery) {
          updated[projectIndex].sections[sectionIndex].gallery = [];
        }
        updated[projectIndex].sections[sectionIndex].gallery.push(...validDataUrls);
        return updated;
      });
      
      console.log(`✅ Added ${validDataUrls.length} image(s) to preview. Click "Save Images" to upload to server.`);
    }
  };

  const removeGalleryImage = (projectIndex, sectionIndex, imageIndex) => {
    const updated = [...projects];
    updated[projectIndex].sections[sectionIndex].gallery.splice(imageIndex, 1);
    setProjects(updated);
  };

  const updateProjectCover = async (index, file) => {
    if (file) {
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target.result;
          const updated = [...projects];
          updated[index] = {
            ...updated[index],
            cover: { ...updated[index].cover, src: dataUrl }
          };
          setProjects(updated);
          console.log('✓ Cover image loaded as preview. Click "Save Images" to upload to server.');
        };
        reader.readAsDataURL(file);
      } catch (err) {
        console.error('Error loading cover:', err);
      }
    }
  };

  const addProject = () => {
    const newIndex = projects.length;
    setProjects([
      ...projects,
      {
        slug: `new-project-${Date.now()}`,
        brand: "New Brand",
        title: "New Project Title",
        subtitle: "Project description",
        cover: { src: "", alt: "Project image" },
        gallery: [],
        sections: [],
        tags: []
      }
    ]);
    setView("events");
    setSelection({ type: "event", index: newIndex });
  };

  const deleteProject = (index) => {
    const updated = projects.filter((_, i) => i !== index);
    setProjects(updated);
    setSelection((prev) => {
      if (prev?.type === "event" && prev.index === index) return null;
      if (prev?.type === "event" && prev.index > index) return { ...prev, index: prev.index - 1 };
      return prev;
    });
  };

  const exportData = () => {
    const formatValue = (value, indent = 0) => {
      const spaces = '  '.repeat(indent);
      if (value === null) return 'null';
      if (value === undefined) return 'undefined';
      if (typeof value === 'string') return `"${value.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`;
      if (typeof value === 'number' || typeof value === 'boolean') return String(value);
      if (Array.isArray(value)) {
        if (value.length === 0) return '[]';
        if (typeof value[0] === 'string') {
          return `[${value.map(v => `"${v}"`).join(', ')}]`;
        }
        const items = value.map(item => `${spaces}  ${formatValue(item, indent + 1)}`).join(',\n');
        return `[\n${items}\n${spaces}]`;
      }
      if (typeof value === 'object') {
        const entries = Object.entries(value)
          .map(([k, v]) => `${spaces}  ${k}: ${formatValue(v, indent + 1)}`)
          .join(',\n');
        return `{\n${entries}\n${spaces}}`;
      }
      return String(value);
    };

    const siteCode = `export const SITE = ${formatValue(siteInfo, 0)};\n\n`;
    const projectsCode = `export const PROJECTS = [\n${projects.map(p => `  ${formatValue(p, 1)}`).join(',\n')}\n];\n\n`;
    const getterCode = `export function getProjectBySlug(slug) {\n  return PROJECTS.find((p) => p.slug === slug);\n}\n`;
    
    const fileContent = `// Edit this file to add / update projects.\n// Replace image placeholders with your real images later.\n\n${siteCode}${projectsCode}${getterCode}`;
    
    const blob = new Blob([fileContent], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "projects.js";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (data.SITE) {
            setSiteInfo({
              ...data.SITE,
              gate: data.SITE.gate?.length ? data.SITE.gate : DEFAULT_GATE.map((d) => ({ ...d })),
              motionHero: data.SITE.motionHero || { ...DEFAULT_MOTION_HERO },
              motion: data.SITE.motion?.length ? data.SITE.motion : DEFAULT_MOTION.map((d) => ({ ...d })),
              motionTools: data.SITE.motionTools?.length
                ? data.SITE.motionTools
                : DEFAULT_MOTION_TOOLS.map((d) => ({ ...d })),
            });
          }
          if (data.PROJECTS) setProjects(data.PROJECTS);
          alert("Data imported successfully!");
        } catch (error) {
          alert("Error importing file: " + error.message);
        }
      };
      reader.readAsText(file);
    }
  };

  const copyToClipboard = () => {
    const formatValue = (value, indent = 0) => {
      const spaces = '  '.repeat(indent);
      if (value === null) return 'null';
      if (value === undefined) return 'undefined';
      if (typeof value === 'string') return `"${value.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`;
      if (typeof value === 'number' || typeof value === 'boolean') return String(value);
      if (Array.isArray(value)) {
        if (value.length === 0) return '[]';
        if (typeof value[0] === 'string') {
          return `[${value.map(v => `"${v}"`).join(', ')}]`;
        }
        const items = value.map(item => `${spaces}  ${formatValue(item, indent + 1)}`).join(',\n');
        return `[\n${items}\n${spaces}]`;
      }
      if (typeof value === 'object') {
        const entries = Object.entries(value)
          .map(([k, v]) => `${spaces}  ${k}: ${formatValue(v, indent + 1)}`)
          .join(',\n');
        return `{\n${entries}\n${spaces}}`;
      }
      return String(value);
    };

    const siteCode = `export const SITE = ${formatValue(siteInfo, 0)};\n\n`;
    const projectsCode = `export const PROJECTS = [\n${projects.map(p => `  ${formatValue(p, 1)}`).join(',\n')}\n];\n\n`;
    const getterCode = `export function getProjectBySlug(slug) {\n  return PROJECTS.find((p) => p.slug === slug);\n}\n`;
    
    const fileContent = `// Edit this file to add / update projects.\n// Replace image placeholders with your real images later.\n\n${siteCode}${projectsCode}${getterCode}`;
    
    navigator.clipboard.writeText(fileContent);
    alert("JavaScript code copied to clipboard! Paste it into src/data/projects.js");
  };

  const saveAllImages = async () => {
    // Get all data URLs from all project galleries and covers
    const imagesToUpload = [];
    
    projects.forEach((project, pIndex) => {
      // Check cover image
      if (project.cover?.src?.startsWith('data:')) {
        imagesToUpload.push({ 
          url: project.cover.src, 
          pIndex, 
          type: 'cover' 
        });
      }
      
      // Check gallery images
      project.sections?.forEach((section, sIndex) => {
        section.gallery?.forEach((url, imgIndex) => {
          if (url.startsWith('data:')) {
            imagesToUpload.push({ 
              url, 
              pIndex, 
              sIndex, 
              imgIndex,
              type: 'gallery'
            });
          }
        });
      });
    });

    siteInfo.gate?.forEach((dest, gIndex) => {
      if (dest.image?.startsWith('data:')) {
        imagesToUpload.push({ url: dest.image, gIndex, type: 'gate-image' });
      }
      if (dest.video?.startsWith('data:')) {
        imagesToUpload.push({ url: dest.video, gIndex, type: 'gate-video' });
      }
    });

    const hero = siteInfo.motionHero || {};
    if (hero.video?.startsWith('data:')) {
      imagesToUpload.push({ url: hero.video, type: 'motion-hero-video' });
    }
    if (hero.poster?.startsWith('data:')) {
      imagesToUpload.push({ url: hero.poster, type: 'motion-hero-poster' });
    }

    siteInfo.motion?.forEach((item, mIndex) => {
      if (item.image?.startsWith('data:')) {
        imagesToUpload.push({ url: item.image, mIndex, type: 'motion-image' });
      }
      if (item.video?.startsWith('data:')) {
        imagesToUpload.push({ url: item.video, mIndex, type: 'motion-video' });
      }
    });

    siteInfo.motionTools?.forEach((item, tIndex) => {
      if (item.video?.startsWith('data:')) {
        imagesToUpload.push({ url: item.video, tIndex, type: 'motion-tool-video' });
      }
    });

    if (imagesToUpload.length === 0) {
      alert('No new images to save. All images are already uploaded!');
      return;
    }

    console.log(`📤 Uploading ${imagesToUpload.length} image(s) to server...`);

    try {
      let savedCount = 0;
      let failedCount = 0;
      const uploadedPaths = [];

      for (const item of imagesToUpload) {
        try {
          const timestamp = Date.now();
          const random = Math.random().toString(36).substr(2, 9);
          const mimeMatch = item.url.match(/data:([^;]+)/);
          const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
          const ext = mimeType.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg';
          const prefix = item.type === 'cover' ? 'cover' : item.type?.startsWith('gate') ? 'gate' : item.type?.startsWith('motion') ? 'motion' : timestamp;
          const filename = `${prefix}-${random}.${ext}`;

          const filePath = await uploadDataUrl(item.url, filename);
          uploadedPaths.push({ ...item, filePath });
          savedCount++;
          console.log(`✓ Saved: ${filename}`);
        } catch (err) {
          failedCount++;
          console.error(`❌ Error saving image:`, err);
        }
      }

      // Update state with file paths
      if (uploadedPaths.length > 0) {
        setProjects(prev => {
          const updated = [...prev];
          uploadedPaths.forEach((item) => {
            if (item.type === 'cover') {
              if (updated[item.pIndex]?.cover) {
                updated[item.pIndex].cover.src = item.filePath;
              }
            } else if (item.type === 'gallery') {
              if (updated[item.pIndex]?.sections?.[item.sIndex]?.gallery?.[item.imgIndex]) {
                updated[item.pIndex].sections[item.sIndex].gallery[item.imgIndex] = item.filePath;
              }
            }
          });
          return updated;
        });

        setSiteInfo((prev) => {
          const gate = [...(prev.gate || [])];
          const motionHero = { ...(prev.motionHero || {}) };
          const motion = [...(prev.motion || [])];
          const motionTools = [...(prev.motionTools || [])];
          uploadedPaths.forEach((item) => {
            if (item.type === 'gate-image' && gate[item.gIndex]) {
              gate[item.gIndex] = { ...gate[item.gIndex], image: item.filePath };
            } else if (item.type === 'gate-video' && gate[item.gIndex]) {
              gate[item.gIndex] = { ...gate[item.gIndex], video: item.filePath };
            } else if (item.type === 'motion-hero-video') {
              motionHero.video = item.filePath;
            } else if (item.type === 'motion-hero-poster') {
              motionHero.poster = item.filePath;
            } else if (item.type === 'motion-image' && motion[item.mIndex]) {
              motion[item.mIndex] = { ...motion[item.mIndex], image: item.filePath };
            } else if (item.type === 'motion-video' && motion[item.mIndex]) {
              motion[item.mIndex] = { ...motion[item.mIndex], video: item.filePath };
            } else if (item.type === 'motion-tool-video' && motionTools[item.tIndex]) {
              motionTools[item.tIndex] = { ...motionTools[item.tIndex], video: item.filePath };
            }
          });
          return { ...prev, gate, motionHero, motion, motionTools };
        });
      }

      if (failedCount > 0) {
        alert(`Saved ${savedCount} images, but ${failedCount} failed.\n\n${failedCount > 0 ? 'Large videos need a working Vercel Blob upload. Check the console for details.' : ''}`);
      } else {
        alert(`✓ Successfully saved ${savedCount} image(s).\n\nClick "Save Online" to publish project data.`);
      }
    } catch (error) {
      alert(`Error uploading: ${error.message}`);
      console.error('Upload error:', error);
    }
  };

  const saveOnline = async () => {
    if (!confirm('This will:\n1. Upload all new images to GitHub\n2. Update projects.js file\n3. Trigger automatic deployment\n\nContinue?')) {
      return;
    }

    try {
      // Step 1: Upload all images first
      const imagesToUpload = [];
      
      projects.forEach((project, pIndex) => {
        if (project.cover?.src?.startsWith('data:')) {
          imagesToUpload.push({ 
            url: project.cover.src, 
            pIndex, 
            type: 'cover' 
          });
        }
        
        project.sections?.forEach((section, sIndex) => {
          section.gallery?.forEach((url, imgIndex) => {
            if (url.startsWith('data:')) {
              imagesToUpload.push({ 
                url, 
                pIndex, 
                sIndex, 
                imgIndex,
                type: 'gallery'
              });
            }
          });
        });
      });

      siteInfo.gate?.forEach((dest, gIndex) => {
        if (dest.image?.startsWith('data:')) {
          imagesToUpload.push({ url: dest.image, gIndex, type: 'gate-image' });
        }
        if (dest.video?.startsWith('data:')) {
          imagesToUpload.push({ url: dest.video, gIndex, type: 'gate-video' });
        }
      });

      const hero = siteInfo.motionHero || {};
      if (hero.video?.startsWith('data:')) {
        imagesToUpload.push({ url: hero.video, type: 'motion-hero-video' });
      }
      if (hero.poster?.startsWith('data:')) {
        imagesToUpload.push({ url: hero.poster, type: 'motion-hero-poster' });
      }

      siteInfo.motion?.forEach((item, mIndex) => {
        if (item.image?.startsWith('data:')) {
          imagesToUpload.push({ url: item.image, mIndex, type: 'motion-image' });
        }
        if (item.video?.startsWith('data:')) {
          imagesToUpload.push({ url: item.video, mIndex, type: 'motion-video' });
        }
      });

      let updatedProjects = [...projects];
      let updatedSiteInfo = {
        ...siteInfo,
        gate: (siteInfo.gate || []).map((d) => ({ ...d })),
        motionHero: { ...(siteInfo.motionHero || {}) },
        motion: (siteInfo.motion || []).map((d) => ({ ...d })),
        motionTools: (siteInfo.motionTools || []).map((d) => ({ ...d })),
      };

      if (imagesToUpload.length > 0) {
        console.log(`📤 Uploading ${imagesToUpload.length} image(s)...`);

        for (const item of imagesToUpload) {
          const timestamp = Date.now();
          const random = Math.random().toString(36).substr(2, 9);
          const mimeMatch = item.url.match(/data:([^;]+)/);
          const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
          const ext = mimeType.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg';
          const prefix = item.type === 'cover' ? 'cover' : item.type?.startsWith('gate') ? 'gate' : item.type?.startsWith('motion') ? 'motion' : timestamp;
          const filename = `${prefix}-${random}.${ext}`;

          try {
            const filePath = await uploadDataUrl(item.url, filename);

            if (item.type === 'cover') {
              if (updatedProjects[item.pIndex]?.cover) {
                updatedProjects[item.pIndex].cover.src = filePath;
              }
            } else if (item.type === 'gallery') {
              if (updatedProjects[item.pIndex]?.sections?.[item.sIndex]?.gallery?.[item.imgIndex]) {
                updatedProjects[item.pIndex].sections[item.sIndex].gallery[item.imgIndex] = filePath;
              }
            } else if (item.type === 'gate-image' && updatedSiteInfo.gate[item.gIndex]) {
              updatedSiteInfo.gate[item.gIndex].image = filePath;
            } else if (item.type === 'gate-video' && updatedSiteInfo.gate[item.gIndex]) {
              updatedSiteInfo.gate[item.gIndex].video = filePath;
            } else if (item.type === 'motion-hero-video') {
              updatedSiteInfo.motionHero.video = filePath;
            } else if (item.type === 'motion-hero-poster') {
              updatedSiteInfo.motionHero.poster = filePath;
            } else if (item.type === 'motion-image' && updatedSiteInfo.motion[item.mIndex]) {
              updatedSiteInfo.motion[item.mIndex].image = filePath;
            } else if (item.type === 'motion-video' && updatedSiteInfo.motion[item.mIndex]) {
              updatedSiteInfo.motion[item.mIndex].video = filePath;
            } else if (item.type === 'motion-tool-video' && updatedSiteInfo.motionTools[item.tIndex]) {
              updatedSiteInfo.motionTools[item.tIndex].video = filePath;
            }
            console.log(`✓ Uploaded: ${filename}`);
          } catch (uploadErr) {
            console.error(uploadErr);
            throw new Error(`Failed to upload ${filename}: ${uploadErr.message}`);
          }
        }

        // Update state with uploaded image paths
        setProjects(updatedProjects);
        setSiteInfo(updatedSiteInfo);
      }

      // Step 2: Generate and upload projects.js file
      console.log('📝 Updating projects.js...');
      
      const formatValue = (value, indent = 0) => {
        if (value === null || value === undefined) return 'null';
        if (typeof value === 'string') return `"${value.replace(/"/g, '\\"')}"`;
        if (typeof value === 'boolean' || typeof value === 'number') return String(value);
        if (Array.isArray(value)) {
          if (value.length === 0) return '[]';
          const items = value.map(v => formatValue(v, indent + 1)).join(', ');
          return `[${items}]`;
        }
        if (typeof value === 'object') {
          const spaces = '  '.repeat(indent);
          const entries = Object.entries(value)
            .map(([k, v]) => `${spaces}  ${k}: ${formatValue(v, indent + 1)}`)
            .join(',\n');
          return `{\n${entries}\n${spaces}}`;
        }
        return String(value);
      };

      // Create JSON data
      const data = {
        SITE: updatedSiteInfo,
        PROJECTS: updatedProjects
      };
      const fileContent = JSON.stringify(data, null, 2);

      const updateUrl = `${getApiBase()}/api/update-projects`;

      const updateResponse = await fetch(updateUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileContent })
      });

      if (!updateResponse.ok) {
        const error = await updateResponse.json().catch(() => ({}));
        throw new Error(error.message || error.error || 'Failed to update projects file');
      }

      const result = await updateResponse.json();
      
      alert(`✓ Success!\n\n${imagesToUpload.length} media file(s) uploaded\nProjects file updated\n\nRefreshing data...`);
      console.log('✓ Save complete:', result);
      
      // Refresh the data from the server
      await refresh();

    } catch (error) {
      console.error('Save online error:', error);
      alert(`❌ Error: ${error.message}\n\nLarge videos upload directly to Vercel Blob now. If this keeps failing, confirm Blob storage is connected on the Vercel project.`);
    }
  };

  if (!siteInfo.gate?.length && !siteInfo.motion?.length && projects.length === 0) {
    return <div className="editor-page"><p>Loading editor...</p></div>;
  }

  const headerActions = (
    <>
      <input
        type="file"
        accept=".json"
        onChange={importData}
        style={{ display: "none" }}
        id="import-input"
      />
      <label htmlFor="import-input" className="btn-editor btn-secondary">
        Import JSON
      </label>
      <button type="button" onClick={saveAllImages} className="btn-editor btn-secondary">
        Save Images
      </button>
      <button type="button" onClick={copyToClipboard} className="btn-editor btn-secondary">
        Copy Code
      </button>
      <button type="button" onClick={exportData} className="btn-editor btn-secondary">
        Export JS
      </button>
      <button type="button" onClick={saveOnline} className="btn-editor btn-primary">
        Save Online
      </button>
    </>
  );

  return (
    <EditorWorkspace
      view={view}
      setView={setView}
      selection={selection}
      setSelection={setSelection}
      siteInfo={siteInfo}
      projects={projects}
      headerActions={headerActions}
      updateSiteInfo={updateSiteInfo}
      updateGateItem={updateGateItem}
      updateGateFile={updateGateFile}
      updateMotionHero={updateMotionHero}
      updateMotionHeroFile={updateMotionHeroFile}
      updateMotionItem={updateMotionItem}
      updateMotionTools={updateMotionTools}
      updateMotionFile={updateMotionFile}
      updateMotionToolItem={updateMotionToolItem}
      updateMotionToolFile={updateMotionToolFile}
      addMotionProject={addMotionProject}
      deleteMotionProject={deleteMotionProject}
      updateProject={updateProject}
      updateSection={updateSection}
      addSection={addSection}
      deleteSection={deleteSection}
      updateProjectCover={updateProjectCover}
      addGalleryImageFile={addGalleryImageFile}
      removeGalleryImage={removeGalleryImage}
      addProject={addProject}
      deleteProject={deleteProject}
    />
  );
}
