import React from 'react';

// ============================================================
// Card (base wrapper)
// ============================================================

interface CardProps {
  children:  React.ReactNode;
  className?: string;
  padding?:  'none' | 'sm' | 'md' | 'lg';
  hover?:    boolean;
  onClick?:  () => void;
}

const paddingMap = {
  none: '',
  sm:   'p-4',
  md:   'p-5',
  lg:   'p-6',
};

export function Card({
  children,
  className = '',
  padding  = 'md',
  hover    = false,
  onClick,
}: CardProps) {
  return (
    <div
      className={[
        'bg-white rounded-xl border border-gray-200 shadow-card',
        paddingMap[padding],
        hover ? 'transition-shadow duration-200 hover:shadow-card-hover cursor-pointer' : '',
        className,
      ].join(' ')}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// ============================================================
// CardHeader
// ============================================================

interface CardHeaderProps {
  title:       React.ReactNode;
  description?: React.ReactNode;
  action?:     React.ReactNode;
  className?:  string;
}

export function CardHeader({ title, description, action, className = '' }: CardHeaderProps) {
  return (
    <div className={['flex items-start justify-between gap-4', className].join(' ')}>
      <div>
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        {description && (
          <p className="text-sm text-gray-500 mt-0.5">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

// ============================================================
// CardDivider
// ============================================================

export function CardDivider({ className = '' }: { className?: string }) {
  return <hr className={['border-gray-100 my-4', className].join(' ')} />;
}

// ============================================================
// StatCard
// ============================================================

interface StatCardProps {
  label:     string;
  value:     string | number;
  icon?:     React.ReactNode;
  trend?:    { value: string; up: boolean };
  color?:    'indigo' | 'teal' | 'green' | 'orange' | 'red' | 'gray';
  className?: string;
}

const colorMap: Record<NonNullable<StatCardProps['color']>, string> = {
  indigo: 'bg-indigo-50 text-primary-700',
  teal:   'bg-teal-50   text-teal-700',
  green:  'bg-green-50  text-green-700',
  orange: 'bg-orange-50 text-orange-700',
  red:    'bg-red-50    text-red-700',
  gray:   'bg-gray-50   text-gray-700',
};

export function StatCard({ label, value, icon, trend, color = 'indigo', className = '' }: StatCardProps) {
  return (
    <div className={['stat-card', className].join(' ')}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {trend && (
            <p className={['text-xs mt-1.5 font-medium', trend.up ? 'text-green-600' : 'text-red-500'].join(' ')}>
              {trend.up ? '↑' : '↓'} {trend.value}
            </p>
          )}
        </div>
        {icon && (
          <div className={['p-2.5 rounded-lg', colorMap[color]].join(' ')}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
