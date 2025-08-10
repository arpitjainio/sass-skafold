import React from 'react';

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

export function PasswordStrengthIndicator({ password, className = '' }: PasswordStrengthIndicatorProps) {
  const getPasswordStrength = (password: string) => {
    if (!password) return { score: 0, label: '', color: '' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['text-red-500', 'text-red-500', 'text-orange-500', 'text-blue-500', 'text-green-500'];
    
    return {
      score: Math.min(score, 4),
      label: labels[Math.min(score, 4)],
      color: colors[Math.min(score, 4)]
    };
  };

  const strength = getPasswordStrength(password);

  if (!password) return null;

  return (
    <div className={`mt-2 ${className}`}>
      <div className="flex items-center space-x-2">
        <div className="flex space-x-1">
          {[0, 1, 2, 3, 4].map((index) => (
            <div
              key={index}
              className={`h-1 w-8 rounded-full ${
                index <= strength.score
                  ? strength.color?.replace('text-', 'bg-') ?? ''
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            />
          ))}
        </div>
        <span className={`text-xs font-medium ${strength.color}`}>
          {strength.label}
        </span>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        Password must be at least 8 characters with uppercase, lowercase, number, and special character
      </p>
    </div>
  );
} 