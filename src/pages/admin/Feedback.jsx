import { useEffect, useState } from "react";
import api from "../../services/api";
import { RefreshCw, MessageSquare, User, AlertCircle, CheckCircle } from "lucide-react";

function Feedback() {
    const [feedbacks, setFeedbacks] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchFeedbacks = async () => {
        setLoading(true);
        try {
            const response = await api.get('/feedback');
            setFeedbacks(response.data);
            setError('');
        } catch (error) {
            setError("Failed to fetch feedback or access denied.");
        } finally {
            setLoading(false);
        }
    }

    const handleResolve = async (id) => {
        try {
            await api.put(`/feedback/${id}/resolve`);
            fetchFeedbacks(); // Refresh list to update status
        } catch (error) {
            setError("Failed to resolve feedback.");
        }
    }

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    return (
        <div className="min-h-screen bg-[#FFF8F0] p-6 md:p-12">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">User Feedback</h1>
                        <p className="text-gray-500 mt-2">Manage and resolve reports and feedback from the community.</p>
                    </div>

                    <button
                        onClick={fetchFeedbacks}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-green-50 hover:text-green-700 hover:border-green-200 transition-all shadow-sm active:scale-95"
                    >
                        <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                        Refresh List
                    </button>
                </div>

                {error && (
                    <div className="mb-8 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3">
                        <AlertCircle size={20} />
                        <span className="font-medium">{error}</span>
                    </div>
                )}

                {loading && feedbacks.length === 0 ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2E7D32]"></div>
                    </div>
                ) : feedbacks.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {feedbacks.map((f) => (
                            <div
                                key={f.feedbackId}
                                className={`bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all border flex flex-col gap-4 group ${f.status === 'RESOLVED' ? 'border-green-200 bg-green-50/30' : 'border-gray-200'}`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${f.status === 'RESOLVED' ? 'bg-green-100 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                                            <MessageSquare size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-800 capitalize truncate max-w-[150px]">{f.user?.username || 'Unknown User'}</h3>
                                            <span className="text-xs font-mono font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded border border-gray-200">
                                                {f.user?.role || 'User'}
                                            </span>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${f.status === 'RESOLVED' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                        {f.status}
                                    </span>
                                </div>

                                <div className="flex-grow w-full overflow-hidden">
                                    <p className="text-xs text-gray-400 mb-2">{new Date(f.createdAt).toLocaleString()}</p>
                                    <h4 className="font-semibold text-gray-800 mb-2 break-words">{f.subject}</h4>
                                    <p className="text-gray-600 text-sm whitespace-pre-wrap break-words break-all">{f.message}</p>
                                </div>

                                {f.status === 'OPEN' ? (
                                    <button
                                        onClick={() => handleResolve(f.feedbackId)}
                                        className="w-full mt-2 flex justify-center items-center gap-2 py-2.5 bg-[#2E7D32] text-white rounded-xl font-medium hover:bg-[#1B5E20] transition-colors"
                                    >
                                        <CheckCircle size={18} />
                                        Mark as Resolved
                                    </button>
                                ) : (
                                    <div className="w-full mt-2 flex justify-center items-center gap-2 py-2.5 bg-green-100/50 text-green-700 rounded-xl font-medium cursor-default">
                                        <CheckCircle size={18} />
                                        Resolved
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 text-gray-400 bg-white rounded-3xl border border-dashed border-gray-200">
                        <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                        <p className="text-lg">No feedback received yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Feedback;
