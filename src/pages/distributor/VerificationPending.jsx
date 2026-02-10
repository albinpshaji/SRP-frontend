import React from "react";
import { useNavigate } from "react-router-dom";

const VerificationPending = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF8F0] p-4">
      <div className="w-full max-w-lg bg-white rounded-[2rem] shadow-2xl p-8 md:p-12 text-center">
        {/* Icon Circle */}
        <div className="mx-auto w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mb-6">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-10 w-10 text-yellow-600" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
        </div>

        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
          Verification Pending
        </h2>
        
        <p className="text-gray-600 mb-8 leading-relaxed">
          Thank you for registering as an NGO with <span className="font-semibold text-[#2E7D32]">Sevana</span>.
          <br /><br />
          Your account is currently waiting for approval. You will be able to access the dashboard once an Admin has verified your profile details.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate('/')}
            className="w-full bg-[#2E7D32] text-white py-3 rounded-xl font-bold hover:bg-[#1B5E20] transition-all shadow-lg active:scale-95"
          >
            Back to Home
          </button>
          
          <button
            onClick={() => {
                localStorage.clear();
                navigate('/login');
            }}
            className="w-full bg-white text-gray-500 py-3 rounded-xl font-semibold hover:bg-gray-50 hover:text-gray-700 transition-all"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerificationPending;