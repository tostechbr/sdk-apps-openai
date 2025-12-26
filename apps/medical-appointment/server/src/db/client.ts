import { createClient } from '@supabase/supabase-js';
import { config } from '../config.js';

export const supabase = createClient(
    config.supabase.url,
    config.supabase.key
);

console.error(`Connected to Supabase at: ${config.supabase.url}`);
