/**
 * Script to migrate existing images from public/project_images to Vercel Blob Storage
 */
const { put } = require('@vercel/blob');
const fs = require('fs');
const path = require('path');

async function migrateImages() {
  try {
    console.log('📤 Migrating images to Vercel Blob Storage...\n');
    
    const imagesDir = path.join(__dirname, '../public/project_images');
    
    if (!fs.existsSync(imagesDir)) {
      console.log('No images directory found. Skipping migration.');
      return;
    }
    
    const files = fs.readdirSync(imagesDir);
    console.log(`Found ${files.length} images to migrate\n`);
    
    const urlMap = {};
    
    for (const filename of files) {
      const filePath = path.join(imagesDir, filename);
      const buffer = fs.readFileSync(filePath);
      
      // Upload to Blob
      const blob = await put(`project_images/${filename}`, buffer, {
        access: 'public',
        addRandomSuffix: false,
      });
      
      urlMap[`/project_images/${filename}`] = blob.url;
      console.log(`✓ ${filename} -> ${blob.url}`);
    }
    
    console.log('\n✅ Migration complete!');
    console.log('\nURL Mappings:');
    console.log(JSON.stringify(urlMap, null, 2));
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrateImages();
