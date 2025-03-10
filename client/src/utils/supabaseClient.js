import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://obffseicxlhqbcldwsks.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9iZmZzZWljeGxocWJjbGR3c2tzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkwNTAyMzEsImV4cCI6MjA1NDYyNjIzMX0.G0HwmiMOf0kbRJi796NqBSZBPJz2UbmqqGY24lO-E14';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
