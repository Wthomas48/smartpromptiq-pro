import React from 'react';
import Logo from './Logo';

export default function LogoTest() {
  return (
    <div className="p-8">
      <h1>Logo Test</h1>
      <div className="space-y-4">
        <div>Small: <Logo size={24} /></div>
        <div>Medium: <Logo size={32} /></div>
        <div>Large: <Logo size={48} /></div>
        <div>Icon only: <Logo size={32} showText={false} /></div>
      </div>
    </div>
  );
}
