// Client-upload token endpoint for Vercel Blob.
// Implemented without `@vercel/blob/client` so Vercel's serverless tracer
 // does not need to resolve client.cjs (which was causing FUNCTION_INVOCATION_FAILED).
import crypto from 'crypto';

const ALLOWED_ORIGINS = [
  'https://m-elgaili.com',
  'https://www.m-elgaili.com',
  'https://portfolio-bice-kappa-24.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:3000',
];

function setCors(req, res) {
  const origin = req.headers.origin || '';
  const allowed = ALLOWED_ORIGINS.includes(origin) || /\.vercel\.app$/i.test(origin);
  if (allowed) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Editor-Auth, X-Requested-With, Accept'
  );
}

function signPayload(payload, token) {
  return crypto.createHmac('sha256', token).update(payload).digest('hex');
}

function generateClientToken({ pathname, tokenOptions = {} }) {
  const readWriteToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (!readWriteToken) {
    throw new Error('Missing BLOB_READ_WRITE_TOKEN');
  }

  const parts = readWriteToken.split('_');
  const storeId = parts[3] || null;
  if (!storeId) {
    throw new Error('Invalid BLOB_READ_WRITE_TOKEN');
  }

  const now = new Date();
  const validUntil =
    tokenOptions.validUntil ??
    (() => {
      const d = new Date(now);
      d.setSeconds(d.getSeconds() + 60 * 60);
      return d.getTime();
    })();

  const payloadObject = {
    pathname,
    allowedContentTypes: tokenOptions.allowedContentTypes,
    maximumSizeInBytes: tokenOptions.maximumSizeInBytes,
    addRandomSuffix: tokenOptions.addRandomSuffix ?? false,
    allowOverwrite: tokenOptions.allowOverwrite ?? true,
    validUntil,
  };

  // Strip undefined keys
  Object.keys(payloadObject).forEach((key) => {
    if (payloadObject[key] === undefined) delete payloadObject[key];
  });

  const payload = Buffer.from(JSON.stringify(payloadObject)).toString('base64');
  const securedKey = signPayload(payload, readWriteToken);
  return `vercel_blob_client_${storeId}_${Buffer.from(`${securedKey}.${payload}`).toString('base64')}`;
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
    let body = req.body;
    if (typeof body === 'string') {
      body = body ? JSON.parse(body) : {};
    }
    if (!body || typeof body !== 'object') {
      body = {};
    }
    const type = body.type;

    if (type === 'blob.generate-client-token') {
      const { pathname } = body.payload || {};
      if (!pathname) {
        return res.status(400).json({ error: 'Missing pathname' });
      }

      const clientToken = generateClientToken({
        pathname,
        tokenOptions: {
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
        },
      });

      return res.status(200).json({
        type: 'blob.generate-client-token',
        clientToken,
      });
    }

    if (type === 'blob.upload-completed') {
      // Optional completion webhook from Vercel Blob; acknowledge it.
      return res.status(200).json({ type: 'blob.upload-completed', response: 'ok' });
    }

    return res.status(400).json({ error: 'Invalid event type' });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({
      error: error.message,
      details: 'Failed to handle client upload token',
    });
  }
}
