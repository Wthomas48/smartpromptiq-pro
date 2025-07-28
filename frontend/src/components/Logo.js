import React from 'react';
export default function Logo({ size = 40 }) {
  return (
    <div className="flex items-center justify-center">
      <div className="bg-blue-600 rounded-lg text-white font-bold flex items-center justify-center" style={{width: size + 'px', height: size + 'px'}}>
        SP
      </div>
    </div>
  );
}
