import { Slot } from "expo-router";
import './global.css';

export default function RootLayout() {
  // Root layout only renders the Slot — navigation/redirects should happen
  // from a child route (for example `src/app/index.tsx`) once the navigator
  // is fully mounted. This prevents navigation-before-mount errors.
  return <Slot />;
}
