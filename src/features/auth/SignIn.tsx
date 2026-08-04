import { useEffect, useRef, useState } from "react";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";

interface Props {
  onCredential: (token: string) => void;
  error: string | null;
}

export default function SignIn({ onCredential, error }: Props) {
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const [scriptReady, setScriptReady] = useState(false);

  // The GSI script loads async, so wait for it to appear on window.
  useEffect(() => {
    if (window.google?.accounts?.id) {
      setScriptReady(true);
      return;
    }
    const timer = setInterval(() => {
      if (window.google?.accounts?.id) {
        setScriptReady(true);
        clearInterval(timer);
      }
    }, 100);
    const giveUp = setTimeout(() => clearInterval(timer), 10000);
    return () => {
      clearInterval(timer);
      clearTimeout(giveUp);
    };
  }, []);

  useEffect(() => {
    if (!scriptReady || !CLIENT_ID || !buttonRef.current) return;
    window.google!.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: (response) => onCredential(response.credential),
      auto_select: false,
      cancel_on_tap_outside: true,
    });
    window.google!.accounts.id.renderButton(buttonRef.current, {
      theme: "outline",
      size: "large",
      text: "signin_with",
      width: 280,
    });
  }, [scriptReady, onCredential]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-6">
      <div className="flex w-full max-w-sm flex-col items-center gap-6 rounded-lg border border-neutral-300 bg-white p-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">JH Mural Admin</h1>
          <p className="text-sm text-neutral-600">
            Sign in with your approved Google account.
          </p>
        </div>

        {error && (
          <p className="w-full rounded-md bg-red-100 p-3 text-center text-sm text-red-800">
            {error}
          </p>
        )}

        {!CLIENT_ID ? (
          <p className="w-full rounded-md bg-amber-100 p-3 text-center text-sm text-amber-900">
            <code>VITE_GOOGLE_CLIENT_ID</code> is not set. Add it to{" "}
            <code>admin/.env</code> and restart the dev server.
          </p>
        ) : (
          <div ref={buttonRef} className="min-h-[44px]" />
        )}

        {CLIENT_ID && !scriptReady && (
          <p className="text-sm text-neutral-500">Loading Google Sign-In…</p>
        )}
      </div>
    </div>
  );
}
