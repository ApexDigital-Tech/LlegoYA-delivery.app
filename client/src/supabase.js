import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hxagourynhdpmujcdjte.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4YWdvdXJ5bmhkcG11amNkanRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyMzkyODksImV4cCI6MjA5MzgxNTI4OX0.sH3JDuzQ5GQWpYoCwf5_WyXc7Oe46gHEkbmNJUvoVqc';

export const supabase = createClient(supabaseUrl, supabaseKey);
