import { useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle, Send, Wifi, WifiOff } from "lucide-react";
import api from "../../services/api";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

function buildSocketUrl(donationId, token) {
    const base = API_BASE_URL.replace(/\/$/, "");
    const wsBase = base.startsWith("https")
        ? base.replace(/^https/, "wss")
        : base.replace(/^http/, "ws");

    return `${wsBase}/ws/donations/${donationId}/chat?token=${encodeURIComponent(token)}`;
}

function formatMessageTime(value) {
    if (!value) return "";
    return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function DonationChat({ donationId, enabled, title = "Chat" }) {
    const [messages, setMessages] = useState([]);
    const [draft, setDraft] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [connectionState, setConnectionState] = useState("idle");
    const [error, setError] = useState("");
    const socketRef = useRef(null);
    const reconnectTimerRef = useRef(null);
    const bottomRef = useRef(null);

    const canSend = useMemo(() => {
        return enabled && draft.trim().length > 0 && !isSending;
    }, [draft, enabled, isSending]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        if (!enabled || !donationId) {
            setMessages([]);
            setConnectionState("idle");
            return undefined;
        }

        let cancelled = false;

        async function loadMessages() {
            setIsLoading(true);
            setError("");
            try {
                const response = await api.get(`/donations/${donationId}/chat`);
                if (!cancelled) {
                    setMessages(response.data || []);
                    api.put(`/donations/${donationId}/chat/read`).catch(() => {});
                }
            } catch (err) {
                console.error("Failed to load chat messages:", err);
                if (!cancelled) {
                    setError("Could not load chat history.");
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        }

        loadMessages();

        return () => {
            cancelled = true;
        };
    }, [donationId, enabled]);

    useEffect(() => {
        if (!enabled || !donationId) {
            return undefined;
        }

        let closedByComponent = false;
        const token = localStorage.getItem("jwt_token");

        if (!token) {
            setConnectionState("disconnected");
            setError("Sign in again to use chat.");
            return undefined;
        }

        function connect() {
            setConnectionState("connecting");
            const socket = new WebSocket(buildSocketUrl(donationId, token));
            socketRef.current = socket;

            socket.onopen = () => {
                setConnectionState("connected");
                setError("");
            };

            socket.onmessage = (event) => {
                try {
                    const payload = JSON.parse(event.data);
                    if (payload.error) {
                        setError(payload.error);
                        return;
                    }

                    setMessages((current) => {
                        if (current.some((message) => message.id === payload.id)) {
                            return current;
                        }
                        return [...current, payload];
                    });
                    api.put(`/donations/${donationId}/chat/read`).catch(() => {});
                } catch (err) {
                    console.error("Failed to parse chat message:", err);
                }
            };

            socket.onerror = () => {
                setConnectionState("disconnected");
            };

            socket.onclose = (event) => {
                socketRef.current = null;
                if (closedByComponent) {
                    return;
                }

                setConnectionState("disconnected");
                if (event.code === 1008 || event.code === 1003 || event.code === 1002) {
                    setError("Live chat connection was rejected. Messages will send through the server.");
                }
                reconnectTimerRef.current = window.setTimeout(connect, 3000);
            };
        }

        connect();

        return () => {
            closedByComponent = true;
            window.clearTimeout(reconnectTimerRef.current);
            socketRef.current?.close();
            socketRef.current = null;
        };
    }, [donationId, enabled]);

    useEffect(() => {
        if (!enabled || !donationId || connectionState === "connected") {
            return undefined;
        }

        const intervalId = window.setInterval(async () => {
            try {
                const response = await api.get(`/donations/${donationId}/chat`);
                setMessages(response.data || []);
            } catch (err) {
                console.error("Failed to refresh chat messages:", err);
            }
        }, 5000);

        return () => window.clearInterval(intervalId);
    }, [connectionState, donationId, enabled]);

    const handleSend = async (event) => {
        event.preventDefault();
        const messageText = draft.trim();
        if (!canSend || !messageText) {
            return;
        }

        setIsSending(true);
        setError("");

        try {
            if (socketRef.current?.readyState === WebSocket.OPEN) {
                socketRef.current.send(JSON.stringify({ message: messageText }));
            } else {
                const response = await api.post(`/donations/${donationId}/chat`, { message: messageText });
                setMessages((current) => {
                    if (current.some((message) => message.id === response.data.id)) {
                        return current;
                    }
                    return [...current, response.data];
                });
            }
            setDraft("");
        } catch (err) {
            console.error("Failed to send chat message:", err);
            setError(err.response?.data || "Could not send message. Please try again.");
        } finally {
            setIsSending(false);
        }
    };

    if (!enabled) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-3 text-gray-700">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <MessageCircle className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                        <h3 className="font-bold">Chat unlocks after acceptance</h3>
                        <p className="text-sm text-gray-500">The donor and NGO can chat once the item is accepted.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <MessageCircle className="w-5 h-5 text-green-700" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800">{title}</h3>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                            {connectionState === "connected" ? (
                                <>
                                    <Wifi className="w-3.5 h-3.5 text-green-600" />
                                    Live
                                </>
                            ) : (
                                <>
                                    <WifiOff className="w-3.5 h-3.5 text-orange-500" />
                                    {connectionState === "connecting" ? "Connecting" : "Server send available"}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="h-80 overflow-y-auto px-4 py-5 bg-gray-50/70 space-y-3">
                {isLoading && (
                    <p className="text-sm text-gray-500 text-center">Loading chat...</p>
                )}

                {!isLoading && messages.length === 0 && (
                    <div className="h-full flex items-center justify-center text-center text-gray-500 text-sm px-6">
                        Start the conversation about pickup timing, item condition, or handoff details.
                    </div>
                )}

                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.mine ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className={`max-w-[82%] rounded-2xl px-4 py-3 shadow-sm ${
                                message.mine
                                    ? "bg-green-700 text-white rounded-br-md"
                                    : "bg-white text-gray-800 border border-gray-100 rounded-bl-md"
                            }`}
                        >
                            {!message.mine && (
                                <p className="text-[11px] font-semibold text-gray-400 mb-1">
                                    {message.senderUsername}
                                </p>
                            )}
                            <p className="text-sm leading-relaxed break-words">{message.message}</p>
                            <p className={`text-[10px] mt-1 ${message.mine ? "text-green-100" : "text-gray-400"}`}>
                                {formatMessageTime(message.createdAt)}
                            </p>
                        </div>
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>

            {error && (
                <div className="px-4 py-2 bg-red-50 text-red-600 text-sm border-t border-red-100">
                    {error}
                </div>
            )}

            <form onSubmit={handleSend} className="p-3 border-t border-gray-100 flex items-center gap-2">
                <input
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    maxLength={1000}
                    placeholder="Type a message..."
                    className="flex-1 min-w-0 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 text-sm"
                />
                <button
                    type="submit"
                    disabled={!canSend}
                    className="w-11 h-11 rounded-xl bg-green-700 text-white flex items-center justify-center hover:bg-green-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="Send message"
                >
                    {isSending ? (
                        <span className="w-4 h-4 border-2 border-white/70 border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <Send className="w-4 h-4" />
                    )}
                </button>
            </form>
        </div>
    );
}

export default DonationChat;
