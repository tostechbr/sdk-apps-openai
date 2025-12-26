import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables from .env file
dotenv.config();

// Define schema for required environment variables
const envSchema = z.object({
    SUPABASE_URL: z.string().url(),
    SUPABASE_KEY: z.string().min(1),
});

// Parse and validate
const env = envSchema.parse({
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_KEY: process.env.SUPABASE_KEY,
});

export const config = {
    supabase: {
        url: env.SUPABASE_URL,
        key: env.SUPABASE_KEY,
    },
};
