// Vercel Serverless Function for updating projects.js file on GitHub

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

    // GitHub API configuration
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const REPO_OWNER = process.env.REPO_OWNER || 'mog-academy';
    const REPO_NAME = process.env.REPO_NAME || 'Portfolio';
    const BRANCH = process.env.BRANCH || 'gh-pages';
    
    if (!GITHUB_TOKEN) {
      return res.status(500).json({ error: 'GitHub token not configured' });
    }

    // Update projects.js file on gh-pages branch
    const path = 'data/projects.json';
    const githubUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`;
    
    // Get current file SHA
    let sha = null;
    try {
      const checkResponse = await fetch(`${githubUrl}?ref=${BRANCH}`, {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });
      if (checkResponse.ok) {
        const existingFile = await checkResponse.json();
        sha = existingFile.sha;
      }
    } catch (e) {
      console.log('File does not exist yet');
    }

    // Encode content to base64
    const contentBase64 = Buffer.from(fileContent).toString('base64');

    // Upload/Update file
    const uploadResponse = await fetch(githubUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Update projects data via editor`,
        content: contentBase64,
        branch: BRANCH,
        ...(sha && { sha }),
      }),
    });

    if (!uploadResponse.ok) {
      const error = await uploadResponse.text();
      throw new Error(`GitHub API error: ${error}`);
    }

    const result = await uploadResponse.json();
    
    console.log(`✓ Updated: ${path} on ${BRANCH} branch`);
    
    res.status(200).json({ 
      success: true, 
      message: 'Projects file updated successfully. GitHub Pages will rebuild automatically.',
      commitUrl: result.commit?.html_url
    });

  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ 
      error: error.message,
      details: 'Failed to update projects file on GitHub'
    });
  }
}
