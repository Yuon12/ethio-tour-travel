import React from "react";
import { useCurrency } from "../context/CurrencyContext";
import { DollarSign } from "lucide-react";

export default function CurrencySwitcher() {
  const { currency, setCurrency } = useCurrency();

  return (
    <div className="inline-flex bg-gray-100 p-1 rounded-xl border border-gray-200">
      <button
        onClick={() => setCurrency("USD")}
        className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
          currency === "USD" 
            ? "bg-white text-dark-900 shadow-sm" 
            : "text-gray-500 hover:text-dark-900"
        }`}
      >
        USD
      </button>
      <button
        onClick={() => setCurrency("ETB")}
        className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
          currency === "ETB" 
            ? "bg-white text-dark-900 shadow-sm" 
            : "text-gray-500 hover:text-dark-900"
        }`}
      >
        ETB
      </button>
    </div>
  );
}