import React, { useState, useEffect } from "react";
import { X, ShieldCheck } from "lucide-react";

const privacypolicy = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const privacyAccepted = localStorage.getItem("privacyAccepted");
    if (!privacyAccepted) {
      setIsVisible(true);
    }
  }, []);

  const acceptPrivacyPolicy = () => {
    localStorage.setItem("privacyAccepted", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full shadow-lg relative">
        {/* Header */}
        <div className="bg-green-600 text-white rounded-t-xl p-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <ShieldCheck size={32} className="text-white" />
            <h2 className="text-2xl font-bold">Privacy Policy</h2>
          </div>
          <button 
            onClick={() => setIsVisible(false)}
            className="hover:bg-white/10 p-2 rounded-full"
          >
            <X size={24} className="text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-gray-600">
          <p>
            We use cookies and similar technologies to provide essential functionality,
            analyze site usage, and enhance your experience. By continuing to use our site,
            you consent to our use of cookies as described in our 
            <a 
              href="/privacy-policy" 
              className="text-green-600 hover:underline ml-1"
            >
              Privacy Policy
            </a>.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              onClick={acceptPrivacyPolicy}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex-1"
            >
              Accept & Continue
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="border-2 border-green-600 text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors flex-1"
            >
              Decline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default privacypolicy;