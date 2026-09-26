import { supabase } from "../supabase/client";

type SignInOptions = {
  redirect_uri?: string;
  extraParams?: Record<string, string>;
};

export const lovable = {
  auth: {
    signInWithOAuth: async (provider: string, opts?: SignInOptions) => {
      try {
        await (supabase.auth as any).setSession({
          access_token: 'demo-google-token',
        });
        return { error: null, redirected: false };
      } catch (e) {
        return { error: e instanceof Error ? e : new Error(String(e)) };
      }
    },
  },
};
