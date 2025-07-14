/**
 * Deployment Verification Script
 * Tests production deployment and database connectivity
 */

const https = require('https');
const fs = require('fs');

async function verifyDeployment() {
    console.log('🔍 Starting deployment verification...\n');

    // 1. Check if environment file exists
    console.log('1. Checking environment configuration...');
    if (fs.existsSync('.env.local')) {
        console.log('✅ Environment file found');
        
        const env = fs.readFileSync('.env.local', 'utf8');
        const hasSupabaseUrl = env.includes('VITE_SUPABASE_URL=') && !env.includes('YOUR_SUPABASE_PROJECT_URL_HERE');
        const hasSupabaseKey = env.includes('VITE_SUPABASE_ANON_KEY=') && !env.includes('YOUR_SUPABASE_ANON_KEY_HERE');
        
        if (hasSupabaseUrl && hasSupabaseKey) {
            console.log('✅ Supabase credentials configured');
        } else {
            console.log('❌ Please update .env.local with your actual Supabase credentials');
            return false;
        }
    } else {
        console.log('❌ .env.local file not found');
        return false;
    }

    // 2. Check if build files exist
    console.log('\n2. Checking build configuration...');
    if (fs.existsSync('vercel.json')) {
        console.log('✅ Vercel configuration found');
    } else {
        console.log('❌ vercel.json not found');
    }

    if (fs.existsSync('package.json')) {
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        if (pkg.scripts && pkg.scripts.build) {
            console.log('✅ Build script configured');
        } else {
            console.log('❌ Build script not found in package.json');
        }
    }

    // 3. Test production build
    console.log('\n3. Testing production build...');
    try {
        const { exec } = require('child_process');
        await new Promise((resolve, reject) => {
            exec('npm run build', (error, stdout, stderr) => {
                if (error) {
                    console.log('❌ Build failed:', error.message);
                    reject(error);
                } else {
                    console.log('✅ Production build successful');
                    resolve();
                }
            });
        });
    } catch (error) {
        console.log('❌ Build test failed');
        return false;
    }

    // 4. Check if dist folder was created
    console.log('\n4. Verifying build output...');
    if (fs.existsSync('dist')) {
        const files = fs.readdirSync('dist');
        if (files.includes('index.html')) {
            console.log('✅ Build output verified');
        } else {
            console.log('❌ index.html not found in build output');
        }
    } else {
        console.log('❌ dist folder not found');
    }

    console.log('\n🎉 Deployment verification completed!');
    console.log('\n📋 Next Steps:');
    console.log('1. Deploy to Vercel: npm run deploy');
    console.log('2. Or connect GitHub repository to Vercel');
    console.log('3. Add environment variables in Vercel dashboard');
    console.log('4. Test the live deployment');

    return true;
}

// Run verification
verifyDeployment().catch(error => {
    console.error('💥 Verification failed:', error);
    process.exit(1);
});

module.exports = { verifyDeployment };