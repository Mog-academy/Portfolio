// Vercel Serverless Function for uploading images to Blob Storage
import { put } from '@vercel/blob';

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
    const { filename, data } = req.body;
    
    if (!filename || !data) {
      return res.status(400).json({ error: 'Missing filename or data' });
    }

    // Convert base64 to buffer
    const base64Data = data.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Upload to Vercel Blob
    const blob = await put(`project_images/${filename}`, buffer, {
      access: 'public',
      addRandomSuffix: false,
    });
    
    console.log(`✓ Uploaded: ${filename} to Blob Storage`);
    
    res.status(200).json({ 
      success: true, 
      path: blob.url,
      message: 'File uploaded successfully to Blob Storage'
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: error.message,
      details: 'Failed to upload file to Blob Storage'
    });
  }
}
