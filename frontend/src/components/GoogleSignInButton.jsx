import React, { useEffect, useRef } from "react";
import client from "../api/client";

export default function GoogleSignInButton({ onSuccess }) {
  const buttonRef = useRef(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) return;
    const scriptId = "google-identity-services";
    const existing = document.getElementById(scriptId);
    const init = () => {
      if (!window.google) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          try {
            const { data } = await client.post("/users/google-oauth", { idToken: response.credential });
            if (data?.token) {
              localStorage.setItem("token", data.token);
              onSuccess?.(data);
            }
          } catch (e) {
            // handled by caller via toast typically
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      if (buttonRef.current) {
        window.google.accounts.id.renderButton(buttonRef.current, {
          type: "standard",
          shape: "pill",
          theme: "filled_black",
          text: "signin_with",
          size: "large",
          width: 320,
        });
      }
    };
    if (existing) {
      init();
      return;
    }
    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = init;
    document.body.appendChild(script);
    return () => {
      // no-op cleanup; Google script can persist
    };
  }, [clientId]);

  if (!clientId) return null;
  return (
    <div className="flex justify-center">
      <div ref={buttonRef} />
    </div>
  );
}


