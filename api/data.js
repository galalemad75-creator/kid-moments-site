// Vercel Serverless Function — GitHub Data Proxy
// Token is stored in Vercel env vars, never exposed to client

const GH_OWNER = 'galalemad75-creator';
const GH_REPO = 'kid-moments-site';
const GH_BRANCH = 'main';
const GH_FILE = 'data.json';

function getToken() {
  return process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';
}

function headers() {
  return {
    'Authorization': `Bearer ${getToken()}`,
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  };
}

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const apiUrl = `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${GH_FILE}`;

  if (req.method === 'GET') {
    // READ data.json — use GitHub API to avoid raw.githubusercontent.com CDN cache
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    try {
      const resp = await fetch(apiUrl + '?ref=' + GH_BRANCH, {
        headers: headers(),
        cache: 'no-store',
      });
      if (!resp.ok) throw new Error('Failed to read from GitHub API');
      const info = await resp.json();
      const content = Buffer.from(info.content, 'base64').toString('utf8');
      const data = JSON.parse(content);
      return res.status(200).json(data);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (req.method === 'POST') {
    // WRITE data.json
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    try {
      const { data } = req.body;
      if (!data) return res.status(400).json({ error: 'No data provided' });

      // Get current SHA (with retry for freshness)
      let sha = null;
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const check = await fetch(apiUrl + '?ref=' + GH_BRANCH, { headers: headers(), cache: 'no-store' });
          if (check.ok) {
            const info = await check.json();
            sha = info.sha;
            break;
          }
        } catch (e) {
          if (attempt === 1) throw e;
          await new Promise(r => setTimeout(r, 1000));
        }
      }

      const content = Buffer.from(JSON.stringify(data, null, 2), 'utf8').toString('base64');
      const body = {
        message: '🎵 Update chapters & songs data',
        content,
        branch: GH_BRANCH,
      };
      if (sha) body.sha = sha;

      const resp = await fetch(apiUrl, {
        method: 'PUT',
        headers: headers(),
        body: JSON.stringify(body),
      });

      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.message || 'GitHub write failed');
      }

      return res.status(200).json({ ok: true });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
