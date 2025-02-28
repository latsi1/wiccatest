"use client";

import { useState } from "react";

export default function WiccaConverter() {
  const [pounds, setPounds] = useState("");
  const [kilograms, setKilograms] = useState("");

  const handleConversion = (e: React.FormEvent) => {
    e.preventDefault();
    const lbs = parseFloat(pounds);
    if (!isNaN(lbs)) {
      const kg = lbs * 0.45359237;
      setKilograms(kg.toFixed(2));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-purple-200 p-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
        <h1 className="text-3xl font-bold text-purple-800 mb-6 text-center">
          Pounds to Kilograms Converter
        </h1>

        <form onSubmit={handleConversion} className="space-y-4">
          <div>
            <label
              htmlFor="pounds"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Pounds (lbs)
            </label>
            <input
              type="number"
              id="pounds"
              value={pounds}
              onChange={(e) => setPounds(e.target.value)}
              placeholder="Enter weight in pounds"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              step="any"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors"
          >
            Convert
          </button>

          {kilograms && (
            <div className="mt-4 p-4 bg-purple-50 rounded-md">
              <p className="text-center text-lg">
                <span className="font-semibold">{pounds} lbs</span> ={" "}
                <span className="font-bold text-purple-800">
                  {kilograms} kg
                </span>
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
