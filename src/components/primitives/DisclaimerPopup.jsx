import React from 'react';

const DisclaimerPopup = ({ onUnderstand }) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md mx-auto text-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">⚠️ Important Disclaimer</h2>
        <p className="text-gray-700 mb-6">
          This application currently displays <strong className="font-semibold text-red-600">mock data</strong> for <strong className="font-semibold text-red-600">AI-powered features</strong> (Quiz generation, YouTube recommendations, Chat). Core AI functionalities are preserved but <strong className="font-semibold text-red-600">not actively used</strong> in this demonstration due to ongoing development and operational costs.
        </p>
        <button
          onClick={onUnderstand}
          className="bg-red-400 hover:bg-red-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          I Understand
        </button>
      </div>
    </div>
  );
};

export default DisclaimerPopup;
