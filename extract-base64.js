const fs = require('fs');
const path = require('path');

// Read projects.js
const projectsPath = path.join(__dirname, 'src', 'data', 'projects.js');
const projectsContent = fs.readFileSync(projectsPath, 'utf8');

// Extract and process base64 data
let mediaCounter = 1;
let updatedContent = projectsContent;

// Function to extract and save base64 data
function extractAndSave(match, fullMatch) {
  const base64Data = match.split(',')[1];
  const mimeType = match.match(/data:([^;]+);base64/)[1];
  
  // Determine file extension
  let ext = 'jpg';
  if (mimeType.includes('png')) ext = 'png';
  else if (mimeType.includes('gif')) ext = 'gif';
  else if (mimeType.includes('webp')) ext = 'webp';
  else if (mimeType.includes('video/mp4')) ext = 'mp4';
  else if (mimeType.includes('video/webm')) ext = 'webm';
  else if (mimeType.includes('video/ogg')) ext = 'ogg';
  
  const filename = `media-${mediaCounter}.${ext}`;
  const filepath = path.join(__dirname, 'public', 'project_images', filename);
  
  // Save file
  const buffer = Buffer.from(base64Data, 'base64');
  fs.writeFileSync(filepath, buffer);
  
  console.log(`Saved: ${filename} (${(buffer.length / 1024).toFixed(2)} KB)`);
  
  mediaCounter++;
  return `/project_images/${filename}`;
}

// Replace base64 cover images
updatedContent = updatedContent.replace(
  /src:\s*"(data:image\/[^"]+)"/g,
  (match, base64) => {
    const newPath = extractAndSave(base64, match);
    return `src: "${newPath}"`;
  }
);

// Replace base64 gallery items
updatedContent = updatedContent.replace(
  /gallery:\s*\[([\s\S]*?)\]/g,
  (match, galleryContent) => {
    let newGalleryContent = galleryContent;
    
    // Find all base64 strings in gallery
    const base64Regex = /"(data:(?:image|video)\/[^"]+)"/g;
    let base64Match;
    
    while ((base64Match = base64Regex.exec(galleryContent)) !== null) {
      const base64 = base64Match[1];
      if (base64.startsWith('data:')) {
        const newPath = extractAndSave(base64, base64Match[0]);
        newGalleryContent = newGalleryContent.replace(base64, newPath);
      }
    }
    
    return `gallery: [${newGalleryContent}]`;
  }
);

// Write updated content back
fs.writeFileSync(projectsPath, updatedContent);

console.log(`\nExtraction complete! Saved ${mediaCounter - 1} media files.`);
console.log('Updated projects.js with file paths.');

