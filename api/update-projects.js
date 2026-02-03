// Vercel Serverless Function for updating projects.json in Blob Storage
import { put, del, list } from '@vercel/blob';

export default async function handler(req, res) {
  // Enable CORS
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://m-elgaili.com',
    'https://www.m-elgaili.com',
    'https://portfolio-bice-kappa-24.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ];
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fileContent } = req.body;
    
    if (!fileContent) {
      return res.status(400).json({ error: 'Missing fileContent' });
    }

    // Delete existing projects.json if it exists
    try {
      const { blobs } = await list({ prefix: 'projects.json' });
      for (const blob of blobs) {
        if (blob.pathname === 'projects.json') {
          await del(blob.url);
          console.log('✓ Deleted old projects.json');
          break;
        }
      }
    } catch (delError) {
      console.log('No existing projects.json to delete');
    }

    // Upload to Vercel Blob
    const blob = await put('projects.json', fileContent, {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
    });
    
    console.log(`✓ Updated projects.json in Blob Storage: ${blob.url}`);
    
    res.status(200).json({ 
      success: true, 
      message: 'Projects file updated successfully in Blob Storage.',
      url: blob.url
    });

  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ 
      error: error.message,
      details: 'Failed to update projects file in Blob Storage'
    });
  }
}
