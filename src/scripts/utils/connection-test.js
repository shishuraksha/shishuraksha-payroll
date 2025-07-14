/**
 * Production Database Connection Test
 * Add this to test connection in the deployed app
 */

window.testDatabaseConnection = async function() {
    console.log('🔍 Testing database connection from browser...');
    
    // Get environment variables
    const supabaseUrl = window.ENV?.VITE_SUPABASE_URL || 
                       import.meta?.env?.VITE_SUPABASE_URL || 
                       'https://woiasmyqbuzqejjhwgkb.supabase.co';
    
    const supabaseKey = window.ENV?.VITE_SUPABASE_ANON_KEY || 
                       import.meta?.env?.VITE_SUPABASE_ANON_KEY || 
                       'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvaWFzbXlxYnV6cWVqamh3Z2tiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MDE0OTksImV4cCI6MjA2ODA3NzQ5OX0.112UtoQR7oRoAsfDeVG6Y8gQv-P3xeDiKnHjKYXSZno';

    console.log('Environment Check:');
    console.log('- Supabase URL:', supabaseUrl);
    console.log('- Supabase Key:', supabaseKey ? supabaseKey.substring(0, 20) + '...' : 'MISSING');
    console.log('- window.ENV:', window.ENV);
    console.log('- import.meta.env:', typeof import !== 'undefined' && import.meta?.env);

    if (!supabaseUrl || !supabaseKey) {
        console.error('❌ Missing environment variables');
        return { success: false, error: 'Missing environment variables' };
    }

    try {
        // Test basic API connection
        console.log('Testing API connection...');
        const response = await fetch(`${supabaseUrl}/rest/v1/departments?select=count`, {
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'count=exact'
            }
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers));

        if (response.ok) {
            const data = await response.json();
            console.log('✅ Database connection successful!');
            console.log('Departments found:', data.length);
            return { success: true, count: data.length };
        } else {
            const errorText = await response.text();
            console.error('❌ Database connection failed');
            console.error('Status:', response.status);
            console.error('Error:', errorText);
            return { success: false, error: errorText, status: response.status };
        }
    } catch (error) {
        console.error('❌ Network error:', error);
        return { success: false, error: error.message };
    }
};

// Auto-test on load if in development
if (window.location.hostname === 'localhost' || window.location.hostname.includes('vercel.app')) {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            console.log('🔧 Auto-testing database connection...');
            window.testDatabaseConnection();
        }, 2000);
    });
}