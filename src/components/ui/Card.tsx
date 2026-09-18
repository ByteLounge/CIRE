import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hover = false,
  ...props
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          'bg-white rounded-xl border border-slate-200/80 shadow-sm p-5',
          hover && 'hover:border-slate-300 hover:shadow-md transition-all',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
