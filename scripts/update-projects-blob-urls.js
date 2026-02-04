/**
 * Script to update projects.json with blob URLs for all images
 */
const { list, del, put } = require('@vercel/blob');

async function updateProjectsWithBlobUrls() {
  try {
    console.log('📥 Fetching current projects.json from Blob Storage...\n');
    
    // Get projects.json blob
    const { blobs } = await list({ prefix: 'projects.json' });
    const projectsBlob = blobs.find(b => b.pathname === 'projects.json');
    
    if (!projectsBlob) {
      console.error('❌ projects.json not found in Blob Storage');
      return;
    }
    
    // Fetch the data
    const response = await fetch(projectsBlob.url);
    const data = await response.json();
    
    console.log('✓ Fetched projects.json');
    console.log('🔄 Updating image paths to blob URLs...\n');
    
    // Convert to string to do replacements
    let jsonString = JSON.stringify(data, null, 2);
    
    // Replace all /project_images/ paths with full blob URLs
    const blobPrefix = 'https://plv5lqcvn2algyop.public.blob.vercel-storage.com';
    jsonString = jsonString.replace(/\"\/project_images\//g, `"${blobPrefix}/project_images/`);
    
    // Count replacements
    const count = (jsonString.match(/plv5lqcvn2algyop\.public\.blob\.vercel-storage\.com/g) || []).length;
    console.log(`✓ Updated ${count} image paths to blob URLs`);
    
    // Delete old projects.json
    await del(projectsBlob.url);
    console.log('✓ Deleted old projects.json');
    
    // Upload new version
    const blob = await put('projects.json', jsonString, {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
    });
    
    console.log('✓ Uploaded updated projects.json');
    console.log('\n✅ Migration complete!');
    console.log(`\nBlob URL: ${blob.url}`);
    console.log('All images now point to Blob Storage URLs!');
    
  } catch (error) {
    console.error('❌ Update failed:', error);
    process.exit(1);
  }
}

updateProjectsWithBlobUrls();
