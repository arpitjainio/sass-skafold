import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from './index';

export interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  iconColor?: string;
  description?: string;
  className?: string;
}

export function StatsCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  iconColor = 'bg-primary-500',
  description,
  className = ''
}: StatsCardProps) {
  const getChangeIcon = () => {
    if (changeType === 'positive') {
      return <TrendingUp className="w-4 h-4 text-green-500" aria-hidden="true" />;
    } else if (changeType === 'negative') {
      return <TrendingDown className="w-4 h-4 text-red-500" aria-hidden="true" />;
    }
    return null;
  };

  const getChangeColor = () => {
    if (changeType === 'positive') {
      return 'text-green-600 dark:text-green-400';
    } else if (changeType === 'negative') {
      return 'text-red-600 dark:text-red-400';
    }
    return 'text-gray-600 dark:text-gray-400';
  };

  return (
    <Card className={`hover:shadow-lg transition-shadow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {title}
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {value}
            </p>
            {description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {description}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-lg ${iconColor}`}>
            <Icon className="w-6 h-6 text-white" aria-hidden="true" />
          </div>
        </div>
        
        {change && (
          <div className="flex items-center mt-4">
            {getChangeIcon()}
            <span className={`ml-1 text-sm font-medium ${getChangeColor()}`}>
              {change}
            </span>
            {changeType !== 'neutral' && (
              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                from last month
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 