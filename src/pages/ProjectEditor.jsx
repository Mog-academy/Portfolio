import React, { useState, useRef, useEffect } from "react";
import { useProjects } from "../context/ProjectsContext.jsx";

export default function ProjectEditor() {
  const { data, loading, refresh } = useProjects();
  const [projects, setProjects] = useState([]);
  const [siteInfo, setSiteInfo] = useState({});
  const [selectedProject, setSelectedProject] = useState(0);
  const processingFiles = useRef(new WeakMap());

  useEffect(() => {
    if (data) {
      setProjects(data.PROJECTS);
      setSiteInfo(data.SITE);
    }
  }, [data]);

  if (loading || !data) {
    return <div className="editor-page"><p>Loading...</p></div>;
  }

  const updateSiteInfo = (field, value) => {
    setSiteInfo({ ...siteInfo, [field]: value });
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
  };

  const deleteProject = (index) => {
    const updated = projects.filter((_, i) => i !== index);
    setProjects(updated);
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
          if (data.SITE) setSiteInfo(data.SITE);
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

    if (imagesToUpload.length === 0) {
      alert('No new images to save. All images are already uploaded!');
      return;
    }

    console.log(`📤 Uploading ${imagesToUpload.length} image(s) to server...`);

    try {
      let savedCount = 0;
      let failedCount = 0;
      const uploadedPaths = [];

      // Upload each data URL to the server
      for (const item of imagesToUpload) {
        try {
          // Generate unique filename
          const timestamp = Date.now();
          const random = Math.random().toString(36).substr(2, 9);
          const mimeMatch = item.url.match(/data:([^;]+)/);
          const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
          const ext = mimeType.split('/')[1] || 'jpg';
          const prefix = item.type === 'cover' ? 'cover' : timestamp;
          const filename = `${prefix}-${random}.${ext}`;

          // Use Vercel function in production, localhost in development
          const apiBase = import.meta.env.VITE_API_URL || '';
          const uploadUrl = window.location.hostname === 'localhost' 
            ? 'http://localhost:3001/upload'
            : `${apiBase}/api/upload`;

          const response = await fetch(uploadUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename, data: item.url })
          });

          if (response.ok) {
            const filePath = `/project_images/${filename}`;
            uploadedPaths.push({ ...item, filePath });
            savedCount++;
            console.log(`✓ Saved: ${filename}`);
          } else {
            failedCount++;
            console.error(`❌ Failed to save image`);
          }
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
      }

      if (failedCount > 0) {
        alert(`Saved ${savedCount} images, but ${failedCount} failed.\n\nMake sure the upload server is running:\nnpm run upload-server`);
      } else {
        alert(`✓ Successfully saved ${savedCount} image(s) to public/project_images/\n\n⚠️ IMPORTANT: Restart your dev server (npm run dev) to see the new images.`);
      }
    } catch (error) {
      alert('Error: Upload server not running.\n\nStart it with: npm run upload-server');
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

      let updatedProjects = [...projects];

      if (imagesToUpload.length > 0) {
        console.log(`📤 Uploading ${imagesToUpload.length} image(s)...`);
        
        const apiBase = import.meta.env.VITE_API_URL || '';
        const uploadUrl = window.location.hostname === 'localhost' 
          ? 'http://localhost:3001/upload'
          : `${apiBase}/api/upload`;

        for (const item of imagesToUpload) {
          const timestamp = Date.now();
          const random = Math.random().toString(36).substr(2, 9);
          const mimeMatch = item.url.match(/data:([^;]+)/);
          const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
          const ext = mimeType.split('/')[1] || 'jpg';
          const prefix = item.type === 'cover' ? 'cover' : timestamp;
          const filename = `${prefix}-${random}.${ext}`;

          const response = await fetch(uploadUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename, data: item.url })
          });

          if (response.ok) {
            const filePath = `/project_images/${filename}`;
            
            // Update in the temporary array
            if (item.type === 'cover') {
              if (updatedProjects[item.pIndex]?.cover) {
                updatedProjects[item.pIndex].cover.src = filePath;
              }
            } else if (item.type === 'gallery') {
              if (updatedProjects[item.pIndex]?.sections?.[item.sIndex]?.gallery?.[item.imgIndex]) {
                updatedProjects[item.pIndex].sections[item.sIndex].gallery[item.imgIndex] = filePath;
              }
            }
            console.log(`✓ Uploaded: ${filename}`);
          } else {
            throw new Error(`Failed to upload ${filename}`);
          }
        }

        // Update state with uploaded image paths
        setProjects(updatedProjects);
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
        SITE: siteInfo,
        PROJECTS: updatedProjects
      };
      const fileContent = JSON.stringify(data, null, 2);

      const apiBase = import.meta.env.VITE_API_URL || '';
      const updateUrl = window.location.hostname === 'localhost'
        ? 'http://localhost:3001/update-projects'
        : `${apiBase}/api/update-projects`;

      const updateResponse = await fetch(updateUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileContent })
      });

      if (!updateResponse.ok) {
        const error = await updateResponse.json();
        throw new Error(error.message || 'Failed to update projects file');
      }

      const result = await updateResponse.json();
      
      alert(`✓ Success!\n\n${imagesToUpload.length} image(s) uploaded\nProjects file updated\n\nRefreshing data...`);
      console.log('✓ Save complete:', result);
      
      // Refresh the data from the server
      await refresh();

    } catch (error) {
      console.error('Save online error:', error);
      alert(`❌ Error: ${error.message}\n\nMake sure you're accessing the site through Vercel URL.`);
    }
  };

  if (projects.length === 0) {
    return <div className="editor-page"><p>Loading editor...</p></div>;
  }

  const currentProject = projects[selectedProject];

  return (
    <div className="editor-page">
      <div className="editor-header">
        <h1>Project Editor</h1>
        <div className="editor-actions">
          <input
            type="file"
            accept=".json"
            onChange={importData}
            style={{ display: 'none' }}
            id="import-input"
          />
          <label htmlFor="import-input" className="btn-editor btn-secondary">
            Import JSON
          </label>
          <button onClick={saveAllImages} className="btn-editor btn-secondary">
            Save Images
          </button>
          <button onClick={copyToClipboard} className="btn-editor btn-secondary">
            Copy Code
          </button>
          <button onClick={exportData} className="btn-editor btn-secondary">
            Save as projects.js
          </button>
          <button onClick={saveOnline} className="btn-editor btn-primary" style={{ marginLeft: '10px' }}>
            💾 Save Online
          </button>
        </div>
      </div>

      <div className="editor-layout">
        <aside className="editor-sidebar">
          <div className="sidebar-section">
            <button
              className={selectedProject === 'site' ? 'sidebar-item active' : 'sidebar-item'}
              onClick={() => setSelectedProject('site')}
            >
              Site Information
            </button>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-header">
              <h3>Projects</h3>
              <button onClick={addProject} className="btn-icon" title="Add Project">
                +
              </button>
            </div>
            {projects.map((project, index) => (
              <button
                key={index}
                className={selectedProject === index ? 'sidebar-item active' : 'sidebar-item'}
                onClick={() => setSelectedProject(index)}
              >
                <span className="sidebar-item-text">{project.brand || `Project ${index + 1}`}</span>
              </button>
            ))}
          </div>
        </aside>

        <main className="editor-content">
          {selectedProject === 'site' ? (
            <section className="editor-section">
              <h2>Site Information</h2>
              <div className="editor-form">
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={siteInfo.name}
                    onChange={(e) => updateSiteInfo("name", e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <input
                    type="text"
                    value={siteInfo.role}
                    onChange={(e) => updateSiteInfo("role", e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    value={siteInfo.location}
                    onChange={(e) => updateSiteInfo("location", e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Headline</label>
                  <input
                    type="text"
                    value={siteInfo.headline}
                    onChange={(e) => updateSiteInfo("headline", e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Intro</label>
                  <textarea
                    value={siteInfo.intro}
                    onChange={(e) => updateSiteInfo("intro", e.target.value)}
                    rows="3"
                  />
                </div>
              </div>
            </section>
          ) : (
            <>
              <div className="project-header">
                <h2>{currentProject.brand}</h2>
                <button
                  onClick={() => {
                    if (window.confirm('Delete this project?')) {
                      deleteProject(selectedProject);
                      setSelectedProject(Math.max(0, selectedProject - 1));
                    }
                  }}
                  className="btn-editor btn-delete"
                >
                  Delete Project
                </button>
              </div>

              <section className="editor-section">
                <h3>Basic Information</h3>
                <div className="editor-form">
                  <div className="form-group">
                    <label>Slug (URL)</label>
                    <input
                      type="text"
                      value={currentProject.slug}
                      onChange={(e) => updateProject(selectedProject, "slug", e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Brand</label>
                    <input
                      type="text"
                      value={currentProject.brand}
                      onChange={(e) => updateProject(selectedProject, "brand", e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Title</label>
                    <input
                      type="text"
                      value={currentProject.title}
                      onChange={(e) => updateProject(selectedProject, "title", e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Subtitle</label>
                    <textarea
                      value={currentProject.subtitle}
                      onChange={(e) => updateProject(selectedProject, "subtitle", e.target.value)}
                      rows="2"
                    />
                  </div>

                  <div className="form-group">
                    <label>Cover Image</label>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={(e) => updateProjectCover(selectedProject, e.target.files[0])}
                    />
                    {currentProject.cover.src && (
                      <div className="image-preview">
                        <img src={currentProject.cover.src} alt="Preview" />
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Cover Alt Text</label>
                    <input
                      type="text"
                      value={currentProject.cover.alt}
                      onChange={(e) => {
                        const updated = [...projects];
                        updated[selectedProject].cover.alt = e.target.value;
                        setProjects(updated);
                      }}
                    />
                  </div>

                  <div className="form-group">
                    <label>Tags (comma-separated)</label>
                    <input
                      type="text"
                      value={currentProject.tags?.join(", ") || ""}
                      onChange={(e) =>
                        updateProject(
                          selectedProject,
                          "tags",
                          e.target.value.split(",").map((t) => t.trim())
                        )
                      }
                    />
                  </div>
                </div>
              </section>

              <section className="editor-section">
                <div className="section-header">
                  <h3>Sections</h3>
                  <button
                    onClick={() => addSection(selectedProject)}
                    className="btn-editor btn-add"
                  >
                    + Add Section
                  </button>
                </div>

                {currentProject.sections?.map((section, sIndex) => (
                  <div key={sIndex} className="section-card">
                    <div className="section-card-header">
                      <h4>Section {sIndex + 1}</h4>
                      <button
                        onClick={() => {
                          if (window.confirm('Delete this section?')) {
                            deleteSection(selectedProject, sIndex);
                          }
                        }}
                        className="btn-editor btn-delete-small"
                      >
                        Delete
                      </button>
                    </div>

                    <div className="editor-form">
                      <div className="form-group">
                        <label>Heading</label>
                        <input
                          type="text"
                          value={section.heading}
                          onChange={(e) =>
                            updateSection(selectedProject, sIndex, "heading", e.target.value)
                          }
                        />
                      </div>

                      <div className="form-group">
                        <label>Body</label>
                        <textarea
                          value={section.body}
                          onChange={(e) =>
                            updateSection(selectedProject, sIndex, "body", e.target.value)
                          }
                          rows="6"
                          placeholder="Use \n\n for new paragraphs"
                        />
                      </div>

                      <div className="form-group">
                        <label>Gallery Media</label>
                        <div className="gallery-editor">
                          {section.gallery?.map((url, imgIndex) => {
                            const isVideo = url.startsWith('data:video/') || /\.(mp4|webm|ogg|mov)$/i.test(url);
                            return (
                              <div key={imgIndex} className="gallery-item">
                                {isVideo ? (
                                  <video src={url} muted loop autoPlay />
                                ) : (
                                  <img src={url} alt={`Gallery ${imgIndex + 1}`} />
                                )}
                                <button
                                  onClick={() => removeGalleryImage(selectedProject, sIndex, imgIndex)}
                                  className="btn-remove"
                                >
                                  ×
                                </button>
                              </div>
                            );
                          })}
                          <div className="add-image-form">
                            <input
                              type="file"
                              accept="image/*,video/*"
                              multiple
                              id={`gallery-${selectedProject}-${sIndex}`}
                              onChange={(e) => {
                                if (e.target.files && e.target.files.length > 0) {
                                  addGalleryImageFile(selectedProject, sIndex, e.target.files);
                                  e.target.value = '';
                                }
                              }}
                              className="file-input"
                            />
                            <label htmlFor={`gallery-${selectedProject}-${sIndex}`} className="file-input-label">
                              + Add Media
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
