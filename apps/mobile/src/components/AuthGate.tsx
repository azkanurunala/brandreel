// components/AuthGate.tsx — jaga SEMUA rute, bukan cuma index.tsx. SPA web
// bisa dibuka langsung ke /home lewat URL tanpa pernah lewat index.tsx —
// tanpa gate ini, layar itu tetap render dengan fallback demo (persona/
// scenario) yang keliatan kayak data asli padahal belum login sama sekali.
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "expo-router";
import { getToken } from "@/lib/session";

const PUBLIC_ROUTES = ["/", "/login", "/onboard"];

export function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let alive = true;
    setChecked(false);
    getToken().then((token) => {
      if (!alive) return;
      if (!token && !PUBLIC_ROUTES.includes(pathname)) {
        router.replace("/onboard");
        return;
      }
      setChecked(true);
    });
    return () => { alive = false; };
  }, [pathname]);

  if (!checked && !PUBLIC_ROUTES.includes(pathname)) return null;
  return <>{children}</>;
}
