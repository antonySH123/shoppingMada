import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "react-loading-skeleton/dist/skeleton.css";
import "./index.css";
import { AuthProvider } from "./context/UserContext.tsx";
import "react-toastify/dist/ReactToastify.css";
import { SkeletonTheme } from "react-loading-skeleton";
import { LanguageProvider } from "./context/LanguageContext";
import { DialogProvider } from "./context/DialogContext";
import { ThemeProvider } from "./context/ThemeContext";
import ThemeAwareToastContainer from "./components/ThemeAwareToastContainer";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <LanguageProvider>
        <ThemeProvider>
          <DialogProvider>
            <SkeletonTheme>
              <App />
            </SkeletonTheme>
            <ThemeAwareToastContainer />
          </DialogProvider>
        </ThemeProvider>
      </LanguageProvider>
    </AuthProvider>
  </StrictMode>,
);
