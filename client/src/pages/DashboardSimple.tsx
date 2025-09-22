import React from 'react';

export default function DashboardSimple() {
  console.log('🔍 DashboardSimple: Component loading...');

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Simple Dashboard Test
        </h1>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Dashboard Working!</h2>
          <p className="text-gray-600">
            This is a simplified dashboard to test if the component can render without errors.
          </p>
          <div className="mt-4 p-4 bg-green-100 border-l-4 border-green-500">
            <p className="text-green-700">✅ Component rendered successfully</p>
          </div>
        </div>
      </div>
    </div>
  );
}