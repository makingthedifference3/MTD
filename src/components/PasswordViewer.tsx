import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordViewerProps {
  password?: string | null;
  label: string;
  description?: string;
  className?: string;
  labelClassName?: string;
  valueClassName?: string;
}

const PasswordViewer = ({
  password,
  label,
  description,
  className = '',
  labelClassName,
  valueClassName,
}: PasswordViewerProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const hasPassword = Boolean(password);

  const maskedValue = '••••••••';
  const displayValue = hasPassword ? (showPassword ? password : maskedValue) : 'Not set';

  return (
    <div className={`flex flex-col gap-1 text-sm text-gray-700 ${className}`}>
      <div className="flex items-center justify-between">
        <p className={labelClassName ?? 'text-xs uppercase tracking-wide text-gray-500'}>{label}</p>
        {hasPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="p-1 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            aria-label={`Toggle ${label} visibility`}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      <p className={valueClassName ?? 'text-sm font-semibold text-gray-900 wrap-break-word'}>{displayValue}</p>
      {description && <p className="text-xs text-gray-500">{description}</p>}
    </div>
  );
};

export default PasswordViewer;
