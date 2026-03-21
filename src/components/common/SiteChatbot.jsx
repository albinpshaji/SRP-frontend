import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Bot, Loader2, MessageCircleMore, SendHorizonal, X } from "lucide-react";
import api from "../../services/api";

const guestSuggestions = [
    "How do I create an account?",
    "What is the marketplace?",
    "How do needs work?",
];

const roleSuggestions = {
    DONOR: [
        "How do I donate an item?",
        "Where can I see my donations?",
        "What does the AI matching feature do?",
    ],
    NGO: [
        "How does logistics work?",
        "How do I claim a marketplace item?",
        "How do I post a need?",
    ],
    WARD_MEMBER: [
        "How does logistics work?",
        "How do incoming donations work?",
        "How do I post a need?",
    ],
    ADMIN: [
        "How do I verify NGOs?",
        "Where can I review feedback?",
        "What can admins manage here?",
    ],
};

const buildWelcomeMessage = (role) => {
    if (role === "DONOR") {
        return "Ask about donating, needs, NGOs, your donations, or the marketplace.";
    }
    if (role === "NGO" || role === "WARD_MEMBER") {
        return "Ask about incoming donations, marketplace claims, logistics, or needs management.";
    }
    if (role === "ADMIN") {
        return "Ask about admin tools like NGO verification and feedback review.";
    }
    return "Ask about how this website works: accounts, donations, NGOs, needs, marketplace, or logistics.";
};

export default function SiteChatbot() {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState(() => {
        const role = (localStorage.getItem("role") || "").toUpperCase();
        return [{
            id: crypto.randomUUID(),
            role: "assistant",
            content: buildWelcomeMessage(role),
            suggestions: roleSuggestions[role] || guestSuggestions,
            fallbackUsed: false,
        }];
    });

    const role = (localStorage.getItem("role") || "").toUpperCase();
    const suggestionSet = useMemo(() => roleSuggestions[role] || guestSuggestions, [role]);

    const sendMessage = async (rawMessage) => {
        const message = rawMessage.trim();
        if (!message || isLoading) return;

        const userMessage = {
            id: crypto.randomUUID(),
            role: "user",
            content: message,
        };

        const nextMessages = [...messages, userMessage];
        setMessages(nextMessages);
        setInput("");
        setIsLoading(true);

        try {
            const history = nextMessages
                .slice(-6)
                .map((item) => ({ role: item.role, content: item.content }));

            const response = await api.post("/ai/website-chat", {
                message,
                role: role || "guest",
                currentPath: location.pathname,
                history,
            });

            setMessages((current) => [...current, {
                id: crypto.randomUUID(),
                role: "assistant",
                content: response.data?.answer || "I couldn't answer that clearly. Try asking about a specific page or action.",
                suggestions: Array.isArray(response.data?.suggestions) && response.data.suggestions.length > 0
                    ? response.data.suggestions
                    : suggestionSet,
                fallbackUsed: Boolean(response.data?.fallbackUsed),
            }]);
        } catch (error) {
            setMessages((current) => [...current, {
                id: crypto.randomUUID(),
                role: "assistant",
                content: "The website assistant is unavailable right now. Try again in a moment.",
                suggestions: suggestionSet,
                fallbackUsed: false,
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const latestAssistant = [...messages].reverse().find((message) => message.role === "assistant");

    return (
        <>
            <div className="fixed right-5 bottom-5 z-[1200] flex items-end gap-3">
                {isOpen && (
                    <div className="w-[min(30rem,calc(100vw-1rem))] h-[min(44rem,calc(100vh-2rem))] rounded-[28px] border border-emerald-100 bg-white shadow-2xl overflow-hidden flex flex-col">
                        <div className="bg-[#14532D] text-white px-5 py-4 flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs uppercase tracking-[0.22em] text-emerald-100 font-semibold">Sevana Assistant</p>
                                <h3 className="mt-1 text-lg font-bold">Website Help</h3>
                                <p className="mt-1 text-sm text-emerald-50/90">
                                    Ask about donations, NGOs, needs, marketplace, logistics, or accounts.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="rounded-full p-2 bg-white/10 hover:bg-white/20 transition-colors"
                                aria-label="Close website assistant"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#FCFFFA]">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex ${message.role === "assistant" ? "justify-start" : "justify-end"}`}
                                >
                                    <div
                                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${message.role === "assistant"
                                            ? "bg-white text-slate-700 border border-slate-100"
                                            : "bg-[#2E7D32] text-white"
                                            }`}
                                    >
                                        {message.role === "assistant" && (
                                            <div className="flex items-center gap-2 mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#2E7D32]">
                                                <Bot className="w-3.5 h-3.5" />
                                                Assistant
                                                {message.fallbackUsed && (
                                                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] text-amber-800">
                                                        Fallback
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                        <p>{message.content}</p>
                                    </div>
                                </div>
                            ))}

                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="rounded-2xl px-4 py-3 bg-white border border-slate-100 text-slate-500 shadow-sm flex items-center gap-2 text-sm">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Thinking...
                                    </div>
                                </div>
                            )}
                        </div>

                        {latestAssistant?.suggestions?.length > 0 && (
                            <div className="px-4 pt-3 pb-2 border-t border-slate-100 bg-white">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400 mb-2">Try asking</p>
                                <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto pr-1">
                                    {latestAssistant.suggestions.map((suggestion) => (
                                        <button
                                            key={suggestion}
                                            type="button"
                                            onClick={() => sendMessage(suggestion)}
                                            className="rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors text-left break-words"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <form
                            onSubmit={(event) => {
                                event.preventDefault();
                                sendMessage(input);
                            }}
                            className="p-4 border-t border-slate-100 bg-white"
                        >
                            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                                <input
                                    value={input}
                                    onChange={(event) => setInput(event.target.value)}
                                    placeholder="Ask about this website..."
                                    className="flex-1 bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400"
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading || !input.trim()}
                                    className="rounded-xl bg-[#2E7D32] p-2 text-white disabled:bg-slate-300 disabled:cursor-not-allowed"
                                    aria-label="Send website assistant message"
                                >
                                    <SendHorizonal className="w-4 h-4" />
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <button
                    type="button"
                    onClick={() => setIsOpen((open) => !open)}
                    className="rounded-full bg-[#2E7D32] text-white shadow-xl hover:bg-[#1B5E20] transition-colors p-4 flex items-center gap-3"
                    aria-label="Open website assistant"
                >
                    <MessageCircleMore className="w-6 h-6" />
                    {!isOpen && <span className="hidden sm:inline text-sm font-bold pr-1">Website Help</span>}
                </button>
            </div>
        </>
    );
}
