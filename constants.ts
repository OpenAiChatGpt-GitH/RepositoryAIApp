// constants.ts

export const SUPABASE_URL = "https://swcrhkgohnbroywpzser.supabase.co";

// Use ANON KEY (safe for browser)
export const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "sb_publishable_WXpXr6RmwCu-5x280moCPQ_Fyf9RuOO";

// Service key only for backend (NOT USED in AI Studio browser environment)
export const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  "sb_secret_0yuqOyLipoQSjXPQ5_umHw_Wwn5srER";

// Mistral API Key
export const MISTRAL_API_KEY =
  process.env.MISTRAL_API_KEY ?? "a89JQezbofngUny4KaqhOamnvfmNOiyc";

// Your Mistral Agent ID
export const MISTRAL_AGENT_ID =
  process.env.MISTRAL_AGENT_ID ?? "ag_019ac7e9e1927787a5dd19c30c84daaa";

// Correct Agents Endpoint
export const MISTRAL_API_URL = "https://api.mistral.ai/v1/agents/completions";

export const REFUND_REASONS = [
  "Item not as described",
  "Received damaged",
  "Wrong item delivered",
  "Size issue",
  "Color mismatch",
  "Changed my mind",
  "Other",
];