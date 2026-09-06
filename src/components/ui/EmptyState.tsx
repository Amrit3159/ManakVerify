import React from 'react';
import { InboxIcon } from 'lucide-react';

interface EmptyStateProps {
  title:       string;
  description?: string;
  icon?:       React.ReactNode;
  action?:     React.ReactNode;
  className?:  string;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={[
        'flex flex-col items-center justify-center py-14 px-6 text-center',
        className,
      ].join(' ')}
    >
      <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gray-100 text-gray-400 mb-4">
        {icon ?? <InboxIcon className="w-7 h-7" />}
      </div>
      <h3 className="text-sm font-semibold text-gray-800 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 max-w-xs">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
