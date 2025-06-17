"use client";

import { useState } from "react";
import PasswordModal from "../../components/PasswordModal";

export default function SecretPage() {
  const [isVideoVisible, setIsVideoVisible] = useState(false);

  const handleCorrectPassword = () => {
    setIsVideoVisible(true);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
      {!isVideoVisible ? (
        <PasswordModal onCorrectPassword={handleCorrectPassword} />
      ) : (
        <div className="w-full max-w-md bg-[#1a1a1a] p-8 rounded-lg shadow-xl border border-[#333]">
          <video
            className="w-full rounded-lg shadow-lg"
            controls
            autoPlay
            src="/wicco.mp4"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      )}
    </div>
  );
}
