import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const api_url = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export default function ServerWakeUp({ children }) {
    const [serverStatus, setServerStatus] = useState('checking'); //checking,sleeping,awake
    const [minimized, setMinimized] = useState(false);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const timerRef = useRef(null);
    const elapsedRef = useRef(null);

    const checkHealth = async () => {
        try {
            await axios.get(`${api_url}/health`, { timeout: 8000 });
            setServerStatus('awake');
            if (timerRef.current) clearInterval(timerRef.current);
            if (elapsedRef.current) clearInterval(elapsedRef.current);
        } catch {
            setServerStatus('sleeping');
        }
    };

    useEffect(() => {
        checkHealth();

        //retries every 10 seconds
        timerRef.current = setInterval(checkHealth, 10000);

    
        elapsedRef.current = setInterval(() => {
            setElapsedSeconds(prev => prev + 1);
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (elapsedRef.current) clearInterval(elapsedRef.current);
        };
    }, []);

    const formatTime = (s) => {
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    };

    // Server is awake or still doing initial check — render children normally
    if (serverStatus === 'awake') return children;
    if (serverStatus === 'checking') {
        return (
            <>
                {children}
                
                <div className="fixed top-0 left-0 right-0 z-[99999] h-1 bg-gradient-to-r from-green-400 via-green-600 to-green-400 animate-pulse" />
            </>
        );
    }

   
    if (minimized) {
        return (
            <>
                {children}
                
                <div
                    onClick={() => setMinimized(false)}
                    className="fixed bottom-6 right-6 z-[99999] cursor-pointer group"
                >
                    <div className="bg-white/95 backdrop-blur-xl border border-orange-200 shadow-2xl rounded-2xl px-5 py-4 flex items-center gap-4 transition-all hover:shadow-orange-200/50 hover:scale-[1.02] active:scale-95 max-w-xs">
                        
                        <div className="relative shrink-0">
                            <div className="w-3 h-3 bg-orange-500 rounded-full" />
                            <div className="absolute inset-0 w-3 h-3 bg-orange-400 rounded-full animate-ping" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-800 truncate">Server waking up...</p>
                            <p className="text-xs text-gray-500">{formatTime(elapsedSeconds)} elapsed</p>
                        </div>
                        <svg className="w-4 h-4 text-gray-400 shrink-0 group-hover:text-gray-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                    </div>
                </div>
            </>
        );
    }

   
    return (
        <>
            {children}
            <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 md:p-10 text-center relative overflow-hidden">

                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-400" />

                    <button
                        onClick={() => setMinimized(true)}
                        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
                        title="Minimize"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center">
                        <div className="relative">
                            <svg className="w-10 h-10 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z" />
                            </svg>
                
                            <div className="absolute -inset-2 rounded-full border-2 border-orange-300 animate-ping opacity-40" />
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Server is Waking Up</h2>
                    <p className="text-gray-500 mb-6 leading-relaxed">
                        Our server goes to sleep after periods of inactivity. It's starting up now — this usually takes
                        <span className="font-semibold text-orange-600"> 3–5 minutes</span>.
                    </p>

                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
                        <div
                            className="h-full bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full transition-all duration-1000"
                            style={{ width: `${Math.min((elapsedSeconds / 300) * 100, 95)}%` }}
                        />
                    </div>

                    <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                        <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
                        <span>Waiting... {formatTime(elapsedSeconds)} elapsed</span>
                    </div>

                    <p className="mt-6 text-xs text-gray-400">
                        You can minimize this and browse around — it will update when the server is ready.
                    </p>
                </div>
            </div>
        </>
    );
}
