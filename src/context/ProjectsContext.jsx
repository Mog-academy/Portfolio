import React, { createContext, useContext, useState, useEffect } from 'react';

const ProjectsContext = createContext();

export function ProjectsProvider({ children }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Get API URL from environment or default to production
      const apiUrl = import.meta.env.VITE_API_URL || 'https://portfolio-bice-kappa-24.vercel.app';
      const response = await fetch(`${apiUrl}/api/get-projects?t=${Date.now()}`); // Cache bust
      
      if (!response.ok) {
        throw new Error('Failed to load projects data');
      }
      
      const jsonData = await response.json();
      setData(jsonData);
      setError(null);
    } catch (err) {
      console.error('Error loading projects:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const refresh = () => {
    loadData();
  };

  return (
    <ProjectsContext.Provider value={{ data, loading, error, refresh }}>
      {children}
    </ProjectsContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectsContext);
  if (!context) {
    throw new Error('useProjects must be used within ProjectsProvider');
  }
  return context;
}

export function getProjectBySlug(projects, slug) {
  return projects.find((p) => p.slug === slug);
}
