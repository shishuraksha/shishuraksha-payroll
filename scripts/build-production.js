/**
 * Production Build Script
 * Optimizes files for production deployment
 */

const fs = require('fs-extra');
const path = require('path');
const { minify } = require('terser');

const BUILD_DIR = 'dist';
const PUBLIC_DIR = 'public';

async function buildProduction() {
    console.log('🚀 Starting production build...');

    try {
        // Clean build directory
        await fs.remove(BUILD_DIR);
        await fs.ensureDir(BUILD_DIR);
        console.log('✅ Cleaned build directory');

        // Copy public files if they exist
        if (await fs.pathExists(PUBLIC_DIR)) {
            await fs.copy(PUBLIC_DIR, BUILD_DIR);
            console.log('✅ Copied public files');
        } else {
            console.log('⚠️ No public directory found, skipping');
        }

        // Copy HTML files to build directory
        const htmlFiles = ['index.html', 'login.html'];
        for (const htmlFile of htmlFiles) {
            if (await fs.pathExists(htmlFile)) {
                await fs.copy(htmlFile, path.join(BUILD_DIR, htmlFile));
                console.log(`✅ Copied ${htmlFile}`);
            }
        }

        // Copy src directory
        if (await fs.pathExists('src')) {
            await fs.copy('src', path.join(BUILD_DIR, 'src'));
            console.log('✅ Copied src directory');
        }

        // Copy any other necessary files
        const additionalFiles = ['vercel.json'];
        for (const file of additionalFiles) {
            if (await fs.pathExists(file)) {
                await fs.copy(file, path.join(BUILD_DIR, file));
            }
        }
        console.log('✅ Copied additional files');

        // Process HTML files
        await processHTMLFiles();
        
        // Minify JavaScript files
        await minifyJavaScriptFiles();
        
        // Create environment configuration
        await createEnvironmentConfig();

        console.log('🎉 Production build completed successfully!');
        console.log(`📦 Build output: ${BUILD_DIR}/`);

    } catch (error) {
        console.error('❌ Build failed:', error);
        process.exit(1);
    }
}

async function processHTMLFiles() {
    const htmlFiles = await findFiles(BUILD_DIR, '.html');
    
    for (const htmlFile of htmlFiles) {
        let content = await fs.readFile(htmlFile, 'utf8');
        
        // Add environment configuration script
        const envScript = `
        <script>
            window.ENV = {
                VITE_SUPABASE_URL: '${process.env.VITE_SUPABASE_URL || ''}',
                VITE_SUPABASE_ANON_KEY: '${process.env.VITE_SUPABASE_ANON_KEY || ''}',
                VITE_APP_NAME: '${process.env.VITE_APP_NAME || 'Shishuraksha Payroll System'}',
                VITE_APP_VERSION: '${process.env.VITE_APP_VERSION || '2.0.0'}',
                VITE_ENVIRONMENT: 'production'
            };
        </script>`;
        
        // Insert environment script before the first script tag
        content = content.replace(
            /<script/,
            envScript + '\n    <script'
        );
        
        // Add Supabase CDN
        const supabaseScript = `
        <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.0/dist/umd/supabase.min.js"></script>`;
        
        content = content.replace(
            /<script src="https:\/\/cdn\.jsdelivr\.net\/npm\/sweetalert2@11"><\/script>/,
            `<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>${supabaseScript}`
        );
        
        // Update title for production
        content = content.replace(
            /<title>.*?<\/title>/,
            '<title>Shishuraksha Payroll System</title>'
        );
        
        await fs.writeFile(htmlFile, content);
    }
    
    console.log(`✅ Processed ${htmlFiles.length} HTML files`);
}

async function minifyJavaScriptFiles() {
    const jsFiles = await findFiles(path.join(BUILD_DIR, 'js'), '.js');
    let minifiedCount = 0;
    
    for (const jsFile of jsFiles) {
        try {
            const content = await fs.readFile(jsFile, 'utf8');
            const result = await minify(content, {
                compress: {
                    drop_console: true, // Remove console.log in production
                    drop_debugger: true,
                    pure_funcs: ['console.log', 'console.info', 'console.debug']
                },
                mangle: false, // Keep function names for debugging
                format: {
                    comments: false
                }
            });
            
            if (result.code) {
                await fs.writeFile(jsFile, result.code);
                minifiedCount++;
            }
        } catch (error) {
            console.warn(`⚠️ Failed to minify ${jsFile}:`, error.message);
        }
    }
    
    console.log(`✅ Minified ${minifiedCount} JavaScript files`);
}

async function createEnvironmentConfig() {
    const envConfig = {
        supabaseUrl: process.env.VITE_SUPABASE_URL || '',
        supabaseAnonKey: process.env.VITE_SUPABASE_ANON_KEY || '',
        appName: process.env.VITE_APP_NAME || 'Shishuraksha Payroll System',
        appVersion: process.env.VITE_APP_VERSION || '2.0.0',
        environment: 'production',
        buildTime: new Date().toISOString()
    };
    
    await fs.writeFile(
        path.join(BUILD_DIR, 'config.json'),
        JSON.stringify(envConfig, null, 2)
    );
    
    console.log('✅ Created environment configuration');
}

async function findFiles(dir, extension) {
    const files = [];
    
    async function walk(currentDir) {
        const items = await fs.readdir(currentDir);
        
        for (const item of items) {
            const fullPath = path.join(currentDir, item);
            const stat = await fs.stat(fullPath);
            
            if (stat.isDirectory()) {
                await walk(fullPath);
            } else if (path.extname(item) === extension) {
                files.push(fullPath);
            }
        }
    }
    
    if (await fs.pathExists(dir)) {
        await walk(dir);
    }
    
    return files;
}

// Run build if called directly
if (require.main === module) {
    buildProduction();
}

module.exports = { buildProduction };