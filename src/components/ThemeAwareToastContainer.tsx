import { ToastContainer } from "react-toastify";
import { useTheme } from "../context/useTheme";

export default function ThemeAwareToastContainer() {
  const { theme } = useTheme();
  return <ToastContainer theme={theme} />;
}
