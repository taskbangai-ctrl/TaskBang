import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kcspshxskizrcyxnohxu.supabase.co';

const supabasePublishableKey =
  'sb_publishable_ftfvVJ6X3Y7xl-t_TVG95w__TSuJWGb';

export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey
);