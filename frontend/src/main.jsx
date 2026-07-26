/**
 * main.jsx — Application Entry Point
 * =====================================
 * Provider stack (outermost → innermost):
 *   BrowserRouter        → client-side routing
 *   QueryClientProvider  → TanStack Query cache
 *   AuthProvider         → global auth state
 *   CurrencyProvider     → live backend client-side pricing currency rates
 *   Toaster              → react-hot-toast notifications
 */
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

// Initialization files
import "./i18n/i18n"; // Must load before <App /> renders to kickstart language detection
import "./index.css";

// Global state contexts
import { AuthProvider } from "./context/AuthContext";
import { CurrencyProvider } from "./context/CurrencyContext";
import App from "./App";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,     // 5 min — data stays fresh
      refetchOnWindowFocus: false,   // don't re-fetch when switching tabs
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CurrencyProvider>
            <App />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: { fontFamily: "Poppins, sans-serif", fontSize: "14px" },
                success: { iconTheme: { primary: "#16a34a", secondary: "#fff" } },
                error:   { iconTheme: { primary: "#dc2626", secondary: "#fff" } },
              }}
            />
          </CurrencyProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);