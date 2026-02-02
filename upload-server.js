const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

// Enable CORS for Vite dev server
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Upload endpoint
app.post('/upload', (req, res) => {
  try {
    const { filename, data } = req.body;
    
    if (!filename || !data) {
      return res.status(400).json({ error: 'Missing filename or data' });
    }

    // Extract base64 data
    const base64Data = data.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Save to public/project_images
    const filepath = path.join(__dirname, 'public', 'project_images', filename);
    fs.writeFileSync(filepath, buffer);
    
    console.log(`✓ Saved: ${filename} (${(buffer.length / 1024).toFixed(2)} KB)`);
    
    res.json({ 
      success: true, 
      path: `/project_images/${filename}`,
      size: buffer.length 
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n📁 Upload server running on http://localhost:${PORT}`);
  console.log(`✓ Ready to save images to public/project_images/\n`);
});
