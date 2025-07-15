// src/components/ui/progress.tsx
import React from 'react';

interface ProgressProps {
  value: number;
  className?: string;
}

export function Progress({ value, className = '' }: ProgressProps) {
  return (
    <div className={`w-full bg-gray-200 rounded-full h-2.5 ${className}`}>
      <div
        className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

// src/components/ui/radio-group.tsx
import React, { createContext, useContext } from 'react';

interface RadioGroupContextType {
  value: string;
  onValueChange: (value: string) => void;
}

const RadioGroupContext = createContext<RadioGroupContextType | undefined>(undefined);

interface RadioGroupProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}

export function RadioGroup({ value, onValueChange, className = '', children }: RadioGroupProps) {
  return (
    <RadioGroupContext.Provider value={{ value, onValueChange }}>
      <div className={className} role="radiogroup">
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
}

interface RadioGroupItemProps {
  value: string;
  id: string;
  className?: string;
}

export function RadioGroupItem({ value, id, className = '' }: RadioGroupItemProps) {
  const context = useContext(RadioGroupContext);
  
  if (!context) {
    throw new Error('RadioGroupItem must be used within a RadioGroup');
  }

  const { value: selectedValue, onValueChange } = context;
  const isSelected = selectedValue === value;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      id={id}
      className={`w-4 h-4 rounded-full border-2 border-gray-300 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
        isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'
      } ${className}`}
      onClick={() => onValueChange(value)}
    >
      {isSelected && (
        <div className="w-2 h-2 rounded-full bg-white" />
      )}
    </button>
  );
}

// src/components/ui/label.tsx
import React from 'react';

interface LabelProps {
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}

export function Label({ htmlFor, className = '', children }: LabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
    >
      {children}
    </label>
  );
}