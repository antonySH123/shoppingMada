import { ToastContainer } from "react-toastify";
import { useTheme } from "../context/useTheme";

export default function ThemeAwareToastContainer() {
  const { resolvedTheme } = useTheme();
  return <ToastContainer theme={resolvedTheme} />;
}
