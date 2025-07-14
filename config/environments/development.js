/**
 * Development Environment Configuration
 */

const developmentConfig = {
    environment: 'development',
    
    // Database settings for development
    database: {
        url: process.env.VITE_SUPABASE_URL || 'http://localhost:54321',
        anonKey: process.env.VITE_SUPABASE_ANON_KEY || '',
        enableLogging: true,
        timeout: 10000
    },
    
    // Development-specific features
    features: {
        enableDebugMode: true,
        enableDetailedLogging: true,
        enableHotReload: true,
        enableSourceMaps: true,
        enableTestData: true
    },
    
    // Performance settings for development
    performance: {
        enableCaching: false,
        enableMinification: false,
        enableCompression: false,
        bundleAnalyzer: true
    },
    
    // Security settings (relaxed for development)
    security: {
        enableCSP: false,
        enableHTTPS: false,
        enableRateLimiting: false,
        corsOrigins: ['http://localhost:3000', 'http://localhost:8000']
    },
    
    // Logging configuration
    logging: {
        level: 'debug',
        enableConsole: true,
        enableFile: false,
        enableRemote: false
    },
    
    // Development tools
    devTools: {
        enableDevPanel: true,
        enablePerformanceMetrics: true,
        enableMemoryMonitoring: true,
        enableNetworkLogging: true
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = developmentConfig;
} else if (typeof window !== 'undefined') {
    window.developmentConfig = developmentConfig;
}