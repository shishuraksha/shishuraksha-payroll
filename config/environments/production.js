/**
 * Production Environment Configuration
 */

const productionConfig = {
    environment: 'production',
    
    // Database settings for production
    database: {
        url: process.env.VITE_SUPABASE_URL,
        anonKey: process.env.VITE_SUPABASE_ANON_KEY,
        enableLogging: false,
        timeout: 30000
    },
    
    // Production-specific features
    features: {
        enableDebugMode: false,
        enableDetailedLogging: false,
        enableHotReload: false,
        enableSourceMaps: false,
        enableTestData: false
    },
    
    // Performance settings for production
    performance: {
        enableCaching: true,
        enableMinification: true,
        enableCompression: true,
        bundleAnalyzer: false,
        cacheMaxAge: 86400, // 24 hours
        enableServiceWorker: true
    },
    
    // Security settings (strict for production)
    security: {
        enableCSP: true,
        enableHTTPS: true,
        enableRateLimiting: true,
        corsOrigins: [process.env.VITE_FRONTEND_URL || 'https://your-domain.vercel.app'],
        enableHSTS: true,
        enableXSSProtection: true,
        enableFrameProtection: true
    },
    
    // Logging configuration
    logging: {
        level: 'error',
        enableConsole: false,
        enableFile: true,
        enableRemote: true,
        remoteEndpoint: process.env.VITE_LOGGING_ENDPOINT
    },
    
    // Monitoring and analytics
    monitoring: {
        enableErrorTracking: true,
        enablePerformanceMonitoring: true,
        enableUserAnalytics: false,
        errorTrackingService: process.env.VITE_ERROR_TRACKING_DSN
    },
    
    // CDN and assets
    assets: {
        enableCDN: true,
        cdnUrl: process.env.VITE_CDN_URL || '',
        enableImageOptimization: true,
        enableLazyLoading: true
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = productionConfig;
} else if (typeof window !== 'undefined') {
    window.productionConfig = productionConfig;
}