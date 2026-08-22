// Vercel Serverless Function: client upload token exchange for Vercel Blob
// Files upload directly from the browser (bypasses the 4.5MB function body limit)
import { handleUpload } from '@vercel/blob/client';

function setCors(req, res) {
  const origin = req.headers.origin || '';
  const allowed =
    [
      'https://m-elgaili.com',
      'https://www.m-elgaili.com',
      'https://portfolio-bice-kappa-24.vercel.app',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:3000',
    ].includes(origin) ||
    /\.vercel\.app$/i.test(origin);

  if (allowed) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, X-Editor-Auth'
  );
}

export default async function handler(req, res) {
  setCors(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const jsonResponse = await handleUpload({
      body: req.body,
      request: req,
      onBeforeGenerateToken: async () => {
        // Editor is already password-gated in the SPA.
        // Restrict what can be uploaded to media types used by the portfolio.
        return {
          allowedContentTypes: [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/webp',
            'image/gif',
            'image/svg+xml',
            'video/mp4',
            'video/webm',
            'video/quicktime',
            'video/x-m4v',
          ],
          maximumSizeInBytes: 200 * 1024 * 1024,
          addRandomSuffix: false,
          allowOverwrite: true,
        };
      },
      onUploadCompleted: async ({ blob }) => {
        console.log(`✓ Client upload completed: ${blob.url}`);
      },
    });

    return res.status(200).json(jsonResponse);
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(400).json({
      error: error.message,
      details: 'Failed to handle client upload',
    });
  }
}
