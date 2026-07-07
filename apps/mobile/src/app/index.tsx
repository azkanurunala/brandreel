// Rute awal — arahkan ke beranda (onboarding penuh dipasang di iterasi Fase 2 berikutnya).
import { Redirect } from "expo-router";

export default function Index() {
  return <Redirect href="/home" />;
}
