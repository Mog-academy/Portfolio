/**
 * Script to upload initial projects.json to Vercel Blob Storage
 */
const { put } = require('@vercel/blob');
const fs = require('fs');
const path = require('path');

async function uploadProjects() {
  try {
    console.log('📤 Uploading projects.json to Vercel Blob Storage...\n');
    
    // Read projects.json
    const projectsPath = path.join(__dirname, '../public/data/projects.json');
    const projectsData = fs.readFileSync(projectsPath, 'utf8');
    
    // Validate JSON
    JSON.parse(projectsData);
    console.log('✓ Validated JSON format');
    
    // Upload to Blob
    const blob = await put('projects.json', projectsData, {
      access: 'public',
      contentType: 'application/json',
    });
    
    console.log('✓ Upload successful!\n');
    console.log('Blob URL:', blob.url);
    console.log('\nYou can now access your projects at this URL.');
    console.log('The frontend will automatically fetch from Blob Storage.');
    
  } catch (error) {
    console.error('❌ Upload failed:', error);
    console.error('\nMake sure you have:');
    console.error('1. Set BLOB_READ_WRITE_TOKEN in your environment');
    console.error('2. Valid projects.json file in public/data/');
    process.exit(1);
  }
}

uploadProjects();
