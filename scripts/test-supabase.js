/**
 * Test Supabase Connection
 * Quick test to verify database connectivity
 */

// Test script to verify Supabase connection
async function testSupabaseConnection() {
    console.log('🔍 Testing Supabase connection...\n');

    // Environment check
    const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://woiasmyqbuzqejjhwgkb.supabase.co';
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvaWFzbXlxYnV6cWVqamh3Z2tiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MDE0OTksImV4cCI6MjA2ODA3NzQ5OX0.112UtoQR7oRoAsfDeVG6Y8gQv-P3xeDiKnHjKYXSZno';

    console.log('1. Environment Variables:');
    console.log('   Supabase URL:', supabaseUrl);
    console.log('   Supabase Key:', supabaseKey.substring(0, 20) + '...');
    console.log('');

    // Test with fetch API
    console.log('2. Testing API connection...');
    try {
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
            }
        });

        if (response.ok) {
            console.log('   ✅ API endpoint is reachable');
        } else {
            console.log('   ❌ API endpoint error:', response.status, response.statusText);
        }
    } catch (error) {
        console.log('   ❌ API connection failed:', error.message);
    }

    // Test table access
    console.log('\n3. Testing table access...');
    try {
        const response = await fetch(`${supabaseUrl}/rest/v1/departments?select=count`, {
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log('   ✅ Tables accessible, departments found:', data.length);
        } else {
            const errorText = await response.text();
            console.log('   ❌ Table access failed:', response.status);
            console.log('   Error details:', errorText);
            
            if (response.status === 404) {
                console.log('   💡 This likely means the database schema hasn\'t been created yet');
            }
        }
    } catch (error) {
        console.log('   ❌ Table test failed:', error.message);
    }

    console.log('\n📋 Next Steps:');
    console.log('1. If API is unreachable: Check Supabase URL and key');
    console.log('2. If tables don\'t exist: Run the database migration in Supabase SQL Editor');
    console.log('3. Migration file: supabase/migrations/001_initial_schema.sql');
    console.log('4. Supabase Dashboard: https://app.supabase.com/project/woiasmyqbuzqejjhwgkb');
}

// Run the test
testSupabaseConnection().catch(console.error);

module.exports = { testSupabaseConnection };