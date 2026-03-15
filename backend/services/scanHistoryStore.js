const { getSupabaseClient, isSupabaseConfigured } = require('../lib/supabaseClient');

const SCAN_HISTORY_TABLE = process.env.SUPABASE_SCAN_HISTORY_TABLE || 'scan_history';

const saveScanRecord = async ({ result, imageMimeType, userId }) => {
  if (!isSupabaseConfigured) {
    return { stored: false, reason: 'supabase_not_configured' };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return { stored: false, reason: 'supabase_not_initialized' };
  }

  const finalResult = {
    ...result,
    meta: {
      ...(result?.meta || {}),
      userId: userId || result?.meta?.userId || null,
    },
  };

  const { error } = await supabase.from(SCAN_HISTORY_TABLE).insert({
    plant_name: result?.plantIdentity?.name || 'Plant',
    disease_name: result?.disease?.name || 'Unknown',
    confidence: result?.disease?.confidence || 0,
    severity: result?.severity || 'medium',
    analysis_mode: result?.meta?.analysisMode || 'live',
    reason_code: result?.meta?.reasonCode || null,
    image_mime_type: imageMimeType || null,
    result: finalResult,
  });

  if (error) {
    console.error('Failed to store scan history in Supabase:', error.message);
    return { stored: false, reason: 'insert_failed' };
  }

  return { stored: true };
};

const getRecentScanHistory = async (limit = 20, userId = null) => {
  if (!isSupabaseConfigured) {
    return [];
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return [];
  }

  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const fetchLimit = Math.min(safeLimit * 5, 500);

  const { data, error } = await supabase
    .from(SCAN_HISTORY_TABLE)
    .select('id, created_at, result, plant_name, disease_name, confidence, severity, analysis_mode, reason_code')
    .order('created_at', { ascending: false })
    .limit(fetchLimit);

  if (error) {
    console.error('Failed to fetch scan history from Supabase:', error.message);
    return [];
  }

  const rows = data || [];
  if (!userId) {
    return rows.slice(0, safeLimit);
  }

  return rows
    .filter((row) => row?.result?.meta?.userId === userId)
    .slice(0, safeLimit);
};

module.exports = {
  saveScanRecord,
  getRecentScanHistory,
};
