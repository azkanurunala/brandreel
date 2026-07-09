// lib/alert.ts — react-native-web's Alert.alert() is a no-op stub (does
// literally nothing — see node_modules/react-native-web/src/exports/Alert),
// so every error message in this app was silently swallowed on web. This
// wraps it: real RN Alert on native, window.alert on web.
import { Alert as RNAlert, Platform } from "react-native";

export const Alert = {
  alert(title: string, message?: string) {
    if (Platform.OS === "web") {
      window.alert(message ? `${title}\n\n${message}` : title);
      return;
    }
    RNAlert.alert(title, message);
  },
};
