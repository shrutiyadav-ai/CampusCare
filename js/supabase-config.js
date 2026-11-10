// Save reference to the Supabase library helper loaded from CDN
const supabaseLib = window.supabase;
window.supabase = null;
window.SUPABASE_CONFIG_ERROR = null;

// Global initialization promise
window.supabaseInitPromise = (async () => {
    let url = null;
    let key = null;

    // 1. Try to read from window.ENV (injected at build time or local env.js)
    if (window.ENV && window.ENV.SUPABASE_URL && window.ENV.SUPABASE_ANON_KEY) {
        url = window.ENV.SUPABASE_URL.trim();
        key = window.ENV.SUPABASE_ANON_KEY.trim();
    }

    // 2. Local Fallback: Try to fetch credentials from relative or root .env file
    if (!url || !key) {
        const envPaths = ['./.env?t=' + Date.now(), '/.env?t=' + Date.now()];
        for (const envPath of envPaths) {
            try {
                const response = await fetch(envPath);
                if (response && response.ok) {
                    const text = await response.text();
                    const lines = text.split('\n');
                    lines.forEach(line => {
                        const cleanLine = line.trim();
                        if (!cleanLine || cleanLine.startsWith('#')) return;
                        
                        const eqIdx = cleanLine.indexOf('=');
                        if (eqIdx !== -1) {
                            const k = cleanLine.slice(0, eqIdx).trim();
                            const v = cleanLine.slice(eqIdx + 1).trim();
                            if ((k === 'SUPABASE_URL' || k === 'VITE_SUPABASE_URL') && !url) {
                                url = v;
                            }
                            if ((k === 'SUPABASE_ANON_KEY' || k === 'SUPABASE_PUBLISHABLE_KEY' || k === 'VITE_SUPABASE_PUBLISHABLE_KEY' || k === 'VITE_SUPABASE_ANON_KEY') && !key) {
                                key = v;
                            }
                        }
                    });
                    if (url && key) break;
                }
            } catch (err) {
                // Ignore fetch errors for local file/blocked servers
            }
        }
    }

    // Verify presence and validity
    if (!url || !key || url.includes('your-project') || key.includes('your-anon-key')) {
        window.SUPABASE_CONFIG_ERROR = 'Supabase configuration is missing. Please configure SUPABASE_URL and SUPABASE_ANON_KEY.';
        console.error(window.SUPABASE_CONFIG_ERROR);
        return;
    }

    // Check if library is present
    if (!supabaseLib || !supabaseLib.createClient) {
        window.SUPABASE_CONFIG_ERROR = 'Supabase library failed to load from CDN. Please check your internet connection.';
        console.error(window.SUPABASE_CONFIG_ERROR);
        return;
    }

    try {
        // Create the instance
        window.supabase = supabaseLib.createClient(url, key, {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true
            }
        });
    } catch (err) {
        window.SUPABASE_CONFIG_ERROR = 'Failed to initialize Supabase client: ' + err.message;
        console.error(window.SUPABASE_CONFIG_ERROR);
    }
})();
