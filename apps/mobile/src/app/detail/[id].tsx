// Placeholder detail kampanye.
import { useLocalSearchParams } from "expo-router";
import { PlaceholderScreen } from "@/components/br/Placeholder";

export default function Screen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <PlaceholderScreen title={"Detail " + id} backable />;
}
