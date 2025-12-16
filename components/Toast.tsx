'use client';

import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
  onClose?: () => void;
}

export default function Toast({ message, type, duration = 3000, onClose }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onClose?.(), 300); // Wait for fade out
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible) return null;

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  }[type];

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={`${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2`}>
        <span>{message}</span>
      </div>
    </div>
  );
}

interface ToastContainerProps {
  toasts: Array<{ id: string; message: string; type: 'success' | 'error' | 'info' }>;
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${
            toast.type === 'success'
              ? 'bg-green-500'
              : toast.type === 'error'
              ? 'bg-red-500'
              : 'bg-blue-500'
          } text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-in`}
        >
          <span>{toast.message}</span>
          <button
            onClick={() => onRemove(toast.id)}
            className="ml-2 text-white hover:text-gray-200"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
