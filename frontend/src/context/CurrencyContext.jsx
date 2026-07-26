import React, { createContext, useContext, useState, useEffect } from "react";
import { paymentApi } from "../api/paymentApi";

const CurrencyContext = createContext(null);

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState("USD"); // "USD" | "ETB"
  const [rate, setRate] = useState(145.00); // Dynamic fallback matching production baseline
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    paymentApi.getExchangeRate()
      .then(({ data }) => {
        if (data && data.rate) {
          setRate(parseFloat(data.rate));
        }
      })
      .catch((err) => console.error("Could not synch live exchange metrics:", err))
      .finally(() => setLoading(false));
  }, []);

  // Live conversion and formatting worker
  const format = (priceInUSD) => {
    const numPrice = parseFloat(priceInUSD) || 0;
    if (currency === "ETB") {
      const converted = (numPrice * rate).toFixed(2);
      // Formats nicely with commas (e.g., 24,340.00 ETB)
      return `${parseFloat(converted).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB`;
    }
    return `$${numPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, rate, format, loading }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error("useCurrency must be wrapped within a CurrencyProvider");
  return context;
}