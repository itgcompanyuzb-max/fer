import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function AuthCallback() {
  const [status, setStatus] = useState("Verifying Google credentials...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function processCallback() {
      try {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const queryParams = new URLSearchParams(window.location.search);

        const accessToken = hashParams.get("access_token") || queryParams.get("access_token");
        const err = hashParams.get("error") || queryParams.get("error");

        if (err) {
          setError(err);
          setStatus("Authentication error: " + err);
          if (window.opener) {
            window.opener.postMessage({ type: "OAUTH_AUTH_ERROR", error: err }, "*");
          }
          setTimeout(() => window.close(), 1500);
          return;
        }

        if (accessToken) {
          setStatus("Fetching user profile from Google...");
          const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: { Authorization: `Bearer ${accessToken}` },
          });

          if (!res.ok) {
            throw new Error("Failed to fetch user profile from Google");
          }

          const profile = await res.json();
          const user = {
            id: profile.sub,
            email: profile.email,
            name: profile.name || profile.email.split("@")[0],
            picture: profile.picture || "",
          };

          if (window.opener) {
            window.opener.postMessage(
              {
                type: "OAUTH_AUTH_SUCCESS",
                provider: "google",
                user,
                accessToken,
              },
              "*"
            );
            setStatus("Success! Closing window...");
            setTimeout(() => window.close(), 300);
          } else {
            await supabase.auth.setSession({
              access_token: accessToken,
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
            window.location.href = "/";
          }
        } else {
          setStatus("No credentials returned.");
          setTimeout(() => window.close(), 1500);
        }
      } catch (e) {
        console.error(e);
        const msg = e instanceof Error ? e.message : "Authentication failed";
        setError(msg);
        setStatus("Error: " + msg);
        setTimeout(() => window.close(), 2000);
      }
    }

    processCallback();
  }, []);

  return (
    <div className="min-h-screen bg-[#191c18] text-[#f4f7f2] flex items-center justify-center p-6">
      <div className="glass max-w-sm w-full rounded-3xl p-8 text-center border border-white/10">
        <div className="text-3xl mb-3">{error ? "⚠️" : "🔐"}</div>
        <h2 className="text-lg font-bold mb-2">Google Authentication</h2>
        <p className="text-xs text-muted-foreground">{status}</p>
      </div>
    </div>
  );
}
