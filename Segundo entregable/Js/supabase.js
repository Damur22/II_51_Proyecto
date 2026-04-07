import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
const supabaseUrl = "https://gilrktwmofgcaprazsqn.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpbHJrdHdtb2ZnY2FwcmF6c3FuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4ODI4NDIsImV4cCI6MjA4NzQ1ODg0Mn0.JjpTakzpfvs05zlTEar9U3SItTSoegcCF79XdZQXkx0";
export const supabase = createClient(supabaseUrl, supabaseKey);