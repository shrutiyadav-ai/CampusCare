// Save reference to the Supabase library helper loaded from CDN
const supabaseLib = window.supabase;
window.supabase = null;
window.SUPABASE_CONFIG_ERROR = null;

// Global initialization promise
window.supabaseInitPromise = (async () => {
    let url = null;
    let key = null;

    try {
        // Try to fetch credentials from the local .env file with a cache-busting query parameter
        const response = await fetch('/.env?t=' + Date.now());
        if (response.ok) {
            const text = await response.text();
            const lines = text.split('\n');
            lines.forEach(line => {
                const cleanLine = line.trim();
                if (!cleanLine || cleanLine.startsWith('#')) return;
                
                const parts = cleanLine.split('=');
                if (parts.length >= 2) {
                    const k = parts[0].trim();
                    const v = parts.slice(1).join('=').trim();
                    if (k === 'SUPABASE_URL' || k === 'VITE_SUPABASE_URL') {
                        url = v;
                    }
                    if (k === 'SUPABASE_ANON_KEY' || k === 'SUPABASE_PUBLISHABLE_KEY' || k === 'VITE_SUPABASE_PUBLISHABLE_KEY' || k === 'VITE_SUPABASE_ANON_KEY') {
                        key = v;
                    }
                }
            });
        }
    } catch (err) {
        console.warn('Could not fetch .env file:', err.message);
    }

    // Verify
    if (!url || !key) {
        window.SUPABASE_CONFIG_ERROR = 'Supabase configuration is missing. Please configure the environment variables.';
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
        window.supabase = supabaseLib.createClient(url, key);
    } catch (err) {
        window.SUPABASE_CONFIG_ERROR = 'Failed to initialize Supabase client: ' + err.message;
        console.error(window.SUPABASE_CONFIG_ERROR);
    }
})();
