import React, { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

// ============================================================
// Input
// ============================================================

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?:       string;
  error?:       string;
  hint?:        string;
  leftIcon?:    React.ReactNode;
  rightIcon?:   React.ReactNode;
  wrapperClass?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, wrapperClass = '', className = '', id, ...rest }, ref) => {
    const inputId = id ?? `input_${Math.random().toString(36).slice(2, 7)}`;

    return (
      <div className={['flex flex-col gap-1.5', wrapperClass].join(' ')}>
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
            {label}
            {rest.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={[
              'block w-full rounded-lg border text-sm text-gray-900 placeholder-gray-400',
              'bg-white py-2.5 px-3.5',
              'transition-colors duration-150',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
              error
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 hover:border-gray-400',
              leftIcon  ? 'pl-10' : '',
              rightIcon ? 'pr-10' : '',
              rest.disabled ? 'bg-gray-50 cursor-not-allowed text-gray-500' : '',
              className,
            ].join(' ')}
            {...rest}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
              {rightIcon}
            </div>
          )}
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

Input.displayName = 'Input';

// ============================================================
// Textarea
// ============================================================

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?:        string;
  error?:        string;
  hint?:         string;
  wrapperClass?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, wrapperClass = '', className = '', id, ...rest }, ref) => {
    const textareaId = id ?? `textarea_${Math.random().toString(36).slice(2, 7)}`;

    return (
      <div className={['flex flex-col gap-1.5', wrapperClass].join(' ')}>
        {label && (
          <label htmlFor={textareaId} className="text-sm font-medium text-gray-700">
            {label}
            {rest.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          rows={4}
          className={[
            'block w-full rounded-lg border text-sm text-gray-900 placeholder-gray-400',
            'bg-white py-2.5 px-3.5 resize-none',
            'transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
            error
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300 hover:border-gray-400',
            rest.disabled ? 'bg-gray-50 cursor-not-allowed text-gray-500' : '',
            className,
          ].join(' ')}
          {...rest}
        />
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

Textarea.displayName = 'Textarea';
