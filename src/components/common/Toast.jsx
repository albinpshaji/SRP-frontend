import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ message, type = 'info', onClose, duration = 3000 }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger animation frame strictly
        requestAnimationFrame(() => setIsVisible(true));

        if (duration > 0) {
            const timer = setTimeout(() => {
                setIsVisible(false);
                setTimeout(onClose, 300); // Wait for transition out
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const config = {
        success: { icon: CheckCircle, className: 'bg-green-50 text-green-800 border-green-200' },
        error: { icon: AlertCircle, className: 'bg-red-50 text-red-800 border-red-200' },
        info: { icon: Info, className: 'bg-blue-50 text-blue-800 border-blue-200' },
    }[type] || config.info;

    const Icon = config.icon;

    return (
        <div
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center justify-between gap-4 p-5 min-w-[320px] max-w-md rounded-2xl border shadow-2xl transition-all duration-300 ease-in-out transform ${isVisible ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-4 opacity-0 scale-95'
                } ${config.className}`}
            role="alert"
        >
            <div className="flex items-center gap-4">
                <Icon className="w-7 h-7 flex-shrink-0" />
                <span className="font-bold text-base">{message}</span>
            </div>
            <button
                onClick={() => {
                    setIsVisible(false);
                    setTimeout(onClose, 300);
                }}
                className="ml-auto text-gray-500 hover:text-gray-800 transition-colors p-1 -mr-2 rounded-full hover:bg-black/5"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

export default Toast;
