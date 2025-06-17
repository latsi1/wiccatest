"use client";

import { useState } from "react";

interface PasswordModalProps {
  onCorrectPassword: () => void;
}

export default function PasswordModal({
  onCorrectPassword,
}: PasswordModalProps) {
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answer.toLowerCase() === "olavi") {
      onCorrectPassword();
    } else {
      setError("Väärä vastaus! Yritä uudelleen.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-8">
      <div className="bg-[#1a1a1a] p-16 rounded-xl shadow-2xl max-w-xl w-full border-2 border-[#333] mx-4">
        <h2 className="text-4xl font-bold mb-12 text-center text-white font-['Cinzel']">
          Mikä on wicca markon toinen nimi?
        </h2>
        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="space-y-4">
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="w-full px-8 py-6 bg-[#2a2a2a] border-2 border-[#333] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9370db] text-white placeholder-gray-400 text-xl shadow-inner"
              placeholder="Kirjoita vastaus tähän..."
            />
          </div>
          {error && (
            <p className="text-[#ff6b6b] text-base bg-[#2a2a2a] p-5 rounded-xl border border-[#ff6b6b]">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="w-full bg-[#9370db] text-white py-6 rounded-xl hover:bg-[#ba55d3] transition-colors font-bold text-2xl mt-12 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
          >
            Tarkista vastaus
          </button>
        </form>
      </div>
    </div>
  );
}
