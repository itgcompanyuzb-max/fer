import { supabase } from "@/integrations/supabase/client";

export interface GoogleAuthUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export function getGoogleClientId(): string {
  return (
    (typeof import.meta !== "undefined" &&
      import.meta.env?.VITE_GOOGLE_CLIENT_ID) ||
    ""
  );
}

export function getRedirectUri(): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/auth/callback.html`;
  }
  return "";
}

/**
 * Builds Google OAuth 2.0 Authorization URL
 */
export function buildGoogleOAuthUrl(clientId: string): string {
  const redirectUri = getRedirectUri();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "token",
    scope: "openid email profile",
    prompt: "select_account",
    include_granted_scopes: "true",
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Performs Google Sign-In using popup window
 */
export async function signInWithGoogle(): Promise<{
  success: boolean;
  user?: GoogleAuthUser;
  error?: string;
  needsConfig?: boolean;
}> {
  const clientId = getGoogleClientId();

  // If no client ID configured yet, notify caller
  if (!clientId || clientId === "MY_GOOGLE_CLIENT_ID" || clientId === "") {
    return {
      success: false,
      needsConfig: true,
      error: "Google Client ID is not configured yet.",
    };
  }

  // 1. Try Google Identity Services token client if available
  const anyWindow = window as any;
  if (anyWindow.google?.accounts?.oauth2) {
    try {
      const tokenPromise = new Promise<{
        success: boolean;
        user?: GoogleAuthUser;
        error?: string;
      }>((resolve) => {
        const client = anyWindow.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: "openid email profile",
          callback: async (resp: any) => {
            if (resp.error) {
              resolve({ success: false, error: resp.error_description || resp.error });
              return;
            }
            try {
              const res = await fetch(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                {
                  headers: { Authorization: `Bearer ${resp.access_token}` },
                }
              );
              const data = await res.json();
              const user: GoogleAuthUser = {
                id: data.sub,
                email: data.email,
                name: data.name || data.email?.split("@")[0] || "Google User",
                picture: data.picture,
              };

              await supabase.auth.setSession({
                access_token: resp.access_token,
                user: {
                  id: user.id,
                  email: user.email,
                  user_metadata: {
                    display_name: user.name,
                    avatar_url: user.picture,
                    provider: "google",
                  },
                },
              });

              resolve({ success: true, user });
            } catch (err) {
              resolve({
                success: false,
                error: err instanceof Error ? err.message : "Failed to fetch profile",
              });
            }
          },
          error_callback: (err: any) => {
            resolve({
              success: false,
              error: err.message || "Google popup cancelled or blocked",
            });
          },
        });

        client.requestAccessToken({ prompt: "select_account" });
      });

      const res = await tokenPromise;
      if (res.success) return res;
    } catch (e) {
      console.warn("GIS token client attempt fallback to standard popup:", e);
    }
  }

  // 2. Standard OAuth Popup flow
  return new Promise((resolve) => {
    const authUrl = buildGoogleOAuthUrl(clientId);
    const width = 500;
    const height = 650;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      authUrl,
      "google_oauth_popup",
      `width=${width},height=${height},left=${left},top=${top},status=no,toolbar=no,menubar=no`
    );

    if (!popup) {
      resolve({
        success: false,
        error: "Popup blocked. Please allow popups for this site.",
      });
      return;
    }

    let finished = false;

    const messageListener = async (event: MessageEvent) => {
      // Accept message from own origin
      if (event.origin !== window.location.origin) return;

      if (event.data?.type === "OAUTH_AUTH_SUCCESS" && event.data?.user) {
        finished = true;
        window.removeEventListener("message", messageListener);
        clearInterval(checkClosedInterval);

        const u = event.data.user;
        const user: GoogleAuthUser = {
          id: u.id,
          email: u.email,
          name: u.name || u.email.split("@")[0],
          picture: u.picture,
        };

        await supabase.auth.setSession({
          access_token: event.data.accessToken || "google-token",
          user: {
            id: user.id,
            email: user.email,
            user_metadata: {
              display_name: user.name,
              avatar_url: user.picture,
              provider: "google",
            },
          },
        });

        resolve({ success: true, user });
      } else if (event.data?.type === "OAUTH_AUTH_ERROR") {
        finished = true;
        window.removeEventListener("message", messageListener);
        clearInterval(checkClosedInterval);
        resolve({
          success: false,
          error: event.data.error || "Google authentication was cancelled",
        });
      }
    };

    window.addEventListener("message", messageListener);

    const checkClosedInterval = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosedInterval);
        window.removeEventListener("message", messageListener);
        if (!finished) {
          resolve({
            success: false,
            error: "Authentication popup was closed.",
          });
        }
      }
    }, 600);
  });
}

/**
 * Direct sign in with custom Google user profile (for seamless demo/testing or fallback)
 */
export async function signInWithMockGoogle(customEmail?: string, customName?: string) {
  const email = customEmail?.trim() || "itgcompanyuzb@gmail.com";
  const name = customName?.trim() || email.split("@")[0];
  const user: GoogleAuthUser = {
    id: "google-usr-" + Date.now(),
    email,
    name,
    picture: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
  };

  await supabase.auth.setSession({
    access_token: "google-token-" + Date.now(),
    user: {
      id: user.id,
      email: user.email,
      user_metadata: {
        display_name: user.name,
        avatar_url: user.picture,
        provider: "google",
      },
    },
  });

  return user;
}
