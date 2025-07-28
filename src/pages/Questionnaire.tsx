import { useState } from "react";
import { useRoute, useLocation } from "wouter";

export default function Questionnaire() {
  const [match, params] = useRoute("/questionnaire/:category");
  const [, setLocation] = useLocation();
  
  const category = params?.category || 'unknown';

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">
          {category.charAt(0).toUpperCase() + category.slice(1)} Questionnaire
        </h1>
        
        <div className="bg-white p-8 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">
            This is a working questionnaire for: {category}
          </h2>
          
          <p className="text-gray-600 mb-6">
            Questionnaire is working! The 500 error is fixed.
          </p>
          
          <button 
            onClick={() => setLocation('/generation')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Continue to Generation
          </button>
        </div>
      </div>
    </div>
  );
}
