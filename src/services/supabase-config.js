/**
 * Supabase Configuration and Client
 * Production-ready configuration with error handling and security
 */

// Supabase configuration
const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL || window.ENV?.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY || window.ENV?.VITE_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('Missing Supabase configuration. Please check your environment variables.');
}

// Initialize Supabase client
let supabase = null;

async function initializeSupabase() {
    try {
        // Load Supabase from CDN if not already loaded
        if (typeof window.supabase === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.0/dist/umd/supabase.min.js';
            document.head.appendChild(script);
            
            await new Promise((resolve, reject) => {
                script.onload = resolve;
                script.onerror = reject;
            });
        }

        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true
            },
            realtime: {
                params: {
                    eventsPerSecond: 10
                }
            }
        });

        console.log('✅ Supabase client initialized successfully');
        return supabase;
    } catch (error) {
        console.error('❌ Failed to initialize Supabase:', error);
        throw error;
    }
}

// Database service class
class DatabaseService {
    constructor() {
        this.client = null;
        this.initialized = false;
    }

    async init() {
        if (!this.initialized) {
            this.client = await initializeSupabase();
            this.initialized = true;
        }
        return this.client;
    }

    async getClient() {
        if (!this.initialized) {
            await this.init();
        }
        return this.client;
    }

    // Error handler
    handleError(error, operation) {
        console.error(`Database error in ${operation}:`, error);
        
        if (error.code === 'PGRST116') {
            throw new Error(`No data found for ${operation}`);
        } else if (error.code === '23505') {
            throw new Error(`Duplicate entry in ${operation}`);
        } else if (error.code === '23503') {
            throw new Error(`Invalid reference in ${operation}`);
        } else {
            throw new Error(`Database error: ${error.message || 'Unknown error'}`);
        }
    }

    // Generic CRUD operations
    async select(table, query = {}) {
        try {
            const client = await this.getClient();
            let queryBuilder = client.from(table).select(query.select || '*');
            
            if (query.eq) {
                Object.entries(query.eq).forEach(([key, value]) => {
                    queryBuilder = queryBuilder.eq(key, value);
                });
            }
            
            if (query.order) {
                queryBuilder = queryBuilder.order(query.order.column, { 
                    ascending: query.order.ascending !== false 
                });
            }
            
            if (query.limit) {
                queryBuilder = queryBuilder.limit(query.limit);
            }

            const { data, error } = await queryBuilder;
            
            if (error) {
                this.handleError(error, `select from ${table}`);
            }
            
            return data || [];
        } catch (error) {
            this.handleError(error, `select from ${table}`);
        }
    }

    async insert(table, data) {
        try {
            const client = await this.getClient();
            const { data: result, error } = await client
                .from(table)
                .insert(data)
                .select();
            
            if (error) {
                this.handleError(error, `insert into ${table}`);
            }
            
            return result;
        } catch (error) {
            this.handleError(error, `insert into ${table}`);
        }
    }

    async update(table, data, conditions) {
        try {
            const client = await this.getClient();
            let queryBuilder = client.from(table).update(data);
            
            Object.entries(conditions).forEach(([key, value]) => {
                queryBuilder = queryBuilder.eq(key, value);
            });

            const { data: result, error } = await queryBuilder.select();
            
            if (error) {
                this.handleError(error, `update ${table}`);
            }
            
            return result;
        } catch (error) {
            this.handleError(error, `update ${table}`);
        }
    }

    async delete(table, conditions) {
        try {
            const client = await this.getClient();
            let queryBuilder = client.from(table).delete();
            
            Object.entries(conditions).forEach(([key, value]) => {
                queryBuilder = queryBuilder.eq(key, value);
            });

            const { error } = await queryBuilder;
            
            if (error) {
                this.handleError(error, `delete from ${table}`);
            }
            
            return true;
        } catch (error) {
            this.handleError(error, `delete from ${table}`);
        }
    }

    async upsert(table, data) {
        try {
            const client = await this.getClient();
            const { data: result, error } = await client
                .from(table)
                .upsert(data)
                .select();
            
            if (error) {
                this.handleError(error, `upsert into ${table}`);
            }
            
            return result;
        } catch (error) {
            this.handleError(error, `upsert into ${table}`);
        }
    }

    // Connection status
    async checkConnection() {
        try {
            const client = await this.getClient();
            const { data, error } = await client.from('departments').select('count').limit(1);
            return !error;
        } catch (error) {
            console.error('Database connection check failed:', error);
            return false;
        }
    }
}

// Create global database service instance
const db = new DatabaseService();

// Export for use in other modules
window.db = db;
window.DatabaseService = DatabaseService;

// Auto-initialize on load
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await db.init();
        console.log('✅ Database service ready');
        
        // Trigger custom event when database is ready
        window.dispatchEvent(new CustomEvent('databaseReady'));
    } catch (error) {
        console.error('❌ Failed to initialize database service:', error);
        
        // Show user-friendly error message
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'error',
                title: 'Database Connection Failed',
                text: 'Unable to connect to the database. Please check your internet connection and try again.',
                confirmButtonText: 'Retry',
                allowOutsideClick: false
            }).then(() => {
                window.location.reload();
            });
        }
    }
});

export { db, DatabaseService };