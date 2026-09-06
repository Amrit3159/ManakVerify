import React from 'react';

interface SpinnerProps {
  size?:     'sm' | 'md' | 'lg';
  className?: string;
  label?:    string;
}

const sizeMap = {
  sm: 'w-4 h-4 border-2',
  md: 'w-7 h-7 border-2',
  lg: 'w-10 h-10 border-[3px]',
};

export function Spinner({ size = 'md', className = '', label }: SpinnerProps) {
  return (
    <div className={['flex flex-col items-center gap-3', className].join(' ')}>
      <div
        className={[
          sizeMap[size],
          'rounded-full border-primary-200 border-t-primary-700 animate-spin',
        ].join(' ')}
        role="status"
        aria-label={label ?? 'Loading'}
      />
      {label && <p className="text-sm text-gray-500">{label}</p>}
    </div>
  );
}

export function FullPageSpinner() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
      <Spinner size="lg" label="Loading MaanakVerify..." />
    </div>
  );
}
