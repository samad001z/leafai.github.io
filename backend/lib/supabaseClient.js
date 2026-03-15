const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

const isSupabaseConfigured = Boolean(supabaseUrl && supabaseServiceRoleKey);
const isSupabaseAuthConfigured = Boolean(supabaseUrl && (supabasePublishableKey || supabaseServiceRoleKey));

const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

const getSupabaseClient = () => supabase;

const supabaseAuthClient = isSupabaseAuthConfigured
  ? createClient(supabaseUrl, supabasePublishableKey || supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

const getSupabaseAuthClient = () => supabaseAuthClient;

module.exports = {
  getSupabaseClient,
  getSupabaseAuthClient,
  isSupabaseConfigured,
  isSupabaseAuthConfigured,
};
