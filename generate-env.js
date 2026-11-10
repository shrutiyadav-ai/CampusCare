const fs = require('fs');
const path = require('path');

let url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
let key = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

// Fallback: Read from local .env if process.env variables are not present
if (!url || !key) {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    try {
      const envText = fs.readFileSync(envPath, 'utf8');
      envText.split('\n').forEach(line => {
        const clean = line.trim();
        if (!clean || clean.startsWith('#')) return;
        const eqIdx = clean.indexOf('=');
        if (eqIdx !== -1) {
          const k = clean.slice(0, eqIdx).trim();
          const v = clean.slice(eqIdx + 1).trim();
          if ((k === 'SUPABASE_URL' || k === 'VITE_SUPABASE_URL') && !url) url = v;
          if ((k === 'SUPABASE_ANON_KEY' || k === 'SUPABASE_PUBLISHABLE_KEY' || k === 'VITE_SUPABASE_ANON_KEY') && !key) key = v;
        }
      });
    } catch (e) {
      console.warn('Could not read .env file:', e.message);
    }
  }
}

const content = `// Generated at build time
window.ENV = {
  SUPABASE_URL: ${JSON.stringify(url)},
  SUPABASE_ANON_KEY: ${JSON.stringify(key)}
};
`;

fs.writeFileSync(path.join(__dirname, 'js', 'env.js'), content);
console.log('Successfully generated js/env.js with SUPABASE_URL:', url ? 'CONFIGURED' : 'EMPTY');
