# Media File Management

## Overview
All project media (images and videos) are now stored as files in `/public/project_images/` instead of base64-encoded data URLs.

## Files Extracted
Successfully extracted **58 media files** from projects.js:
- **53 images** (JPG/PNG)
- **5 videos** (MP4)
- Total size: ~31 MB

## Structure
```
public/
├── project_images/          # Project-specific media uploaded via editor
│   ├── media-1.jpg
│   ├── media-2.jpg
│   └── ...
├── image (1).jpg            # Existing media files
├── video (1).mp4
└── ...
```

## Editor Behavior
When you upload media through the project editor:
1. Files are assigned unique timestamped names
2. Referenced as `/project_images/filename.ext` in projects.js
3. **Note**: For development, files are stored in browser localStorage (limited to ~5-10MB per origin)
4. For production, you should implement a server endpoint to actually save files

## Adding Server Upload (Production)
To properly save files in production, add an upload endpoint:

```javascript
// Example server endpoint (Express)
app.post('/api/upload', upload.single('file'), (req, res) => {
  const filename = req.body.filename;
  const filepath = path.join(__dirname, 'public/project_images', filename);
  fs.writeFileSync(filepath, req.file.buffer);
  res.json({ path: `/project_images/${filename}` });
});
```

Then update ProjectEditor.jsx to use fetch instead of localStorage.

## Benefits
- ✅ **Much smaller bundle size** (from ~30MB to ~100KB)
- ✅ **Faster page loads** (images lazy-load on demand)
- ✅ **Better caching** (browsers cache image files efficiently)
- ✅ **Smaller git repository**
- ✅ **CDN-ready** (easy to move to cloud storage)
