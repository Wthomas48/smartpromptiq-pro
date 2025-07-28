import * as React from "react";

interface RadioGroupProps {
  name: string;
  options: { label: string; value: string }[];
  selectedValue: string;
  onChange: (value: string) => void;
}

export default function RadioGroup({
  name,
  options,
  selectedValue,
  onChange,
}: RadioGroupProps) {
  return (
    <div className="space-y-2">
      {options.map((option) => (
        <label key={option.value} className="flex items-center space-x-2">
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={selectedValue === option.value}
            onChange={() => onChange(option.value)}
            className="form-radio"
          />
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  );
}
