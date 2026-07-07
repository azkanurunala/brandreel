// Rute awal — mulai dari onboarding (sama seperti prototype).
import { Redirect } from "expo-router";

export default function Index() {
  return <Redirect href="/onboard" />;
}
