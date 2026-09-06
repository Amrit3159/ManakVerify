import React, { forwardRef } from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';

// ============================================================
// Select
// ============================================================

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?:        string;
  error?:        string;
  hint?:         string;
  options:       SelectOption[];
  placeholder?:  string;
  wrapperClass?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      hint,
      options,
      placeholder,
      wrapperClass = '',
      className    = '',
      id,
      ...rest
    },
    ref
  ) => {
    const selectId = id ?? `select_${Math.random().toString(36).slice(2, 7)}`;

    return (
      <div className={['flex flex-col gap-1.5', wrapperClass].join(' ')}>
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-gray-700">
            {label}
            {rest.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            className={[
              'block w-full rounded-lg border text-sm text-gray-900',
              'bg-white py-2.5 pl-3.5 pr-10 appearance-none',
              'transition-colors duration-150 cursor-pointer',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
              error
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 hover:border-gray-400',
              rest.disabled ? 'bg-gray-50 cursor-not-allowed text-gray-500' : '',
              className,
            ].join(' ')}
            {...rest}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map(opt => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        {error && (
          <p className="flex items-center gap-1 text-xs text-red-600">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="text-xs text-gray-500">{hint}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
