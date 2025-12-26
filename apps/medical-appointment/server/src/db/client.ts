import { createClient } from '@supabase/supabase-js';
import { config } from '../config.js';

// Initialize the Supabase Client
// We use the keys defined in config.ts (loaded from .env)
export const supabase = createClient(
    config.supabase.url,
    config.supabase.key
);

console.log(`Connected to Supabase at: ${config.supabase.url}`);
