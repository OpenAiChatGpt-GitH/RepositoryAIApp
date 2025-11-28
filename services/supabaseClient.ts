// supabaseClient.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { SUPABASE_URL, SUPABASE_KEY } from "../constants";

/**
 * Supabase client for the AI Refund Compliance Checker.
 *
 * IMPORTANT:
 * - This client uses the PUBLIC / ANON key (SUPABASE_KEY).
 * - It is safe to use in the browser for read-only operations,
 *   as long as your RLS policies on the Supabase tables allow
 *   appropriate SELECT access for the anon role.
 *
 * For any privileged operations (insert/update/delete without RLS),
 * use SUPABASE_SERVICE_KEY on a true backend (e.g., Vercel API route),
 * not in browser code.
 */

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
