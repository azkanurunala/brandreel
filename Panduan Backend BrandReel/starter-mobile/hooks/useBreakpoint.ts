// hooks/useBreakpoint.ts — kelas tampilan responsif (Bab 12)
// Otomatis update saat perangkat diputar / jendela browser di-resize.
import { useWindowDimensions } from "react-native";

export type Breakpoint = "mobile" | "tabletPortrait" | "tabletLandscape" | "desktop";

export function useBreakpoint(): Breakpoint {
  const { width } = useWindowDimensions();
  if (width < 600) return "mobile";
  if (width < 900) return "tabletPortrait";
  if (width < 1280) return "tabletLandscape";
  return "desktop";
}

// Bantu hitung jumlah kolom grid per kelas.
export function useColumns(): number {
  const bp = useBreakpoint();
  return bp === "mobile" ? 1 : bp === "tabletPortrait" ? 2 : bp === "tabletLandscape" ? 3 : 4;
}
