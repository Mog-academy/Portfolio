/**
 * Vercel Serverless Function to get projects data from Blob Storage
 */
import { list } from '@vercel/blob';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // List all blobs and find projects.json
    const { blobs } = await list();
    const projectsBlob = blobs.find(blob => blob.pathname === 'projects.json');
    
    if (!projectsBlob) {
      return res.status(404).json({ error: 'Projects data not found' });
    }

    // Fetch the actual data from the blob URL
    const response = await fetch(projectsBlob.url);
    const data = await response.json();
    
    res.status(200).json(data);

  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ 
      error: error.message,
      details: 'Failed to fetch projects from Blob Storage'
    });
  }
}
