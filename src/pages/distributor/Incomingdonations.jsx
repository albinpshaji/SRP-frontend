import api from "../../services/api";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, X, Package, Loader2 } from "lucide-react"; 

// --- 1. Helper Component for Secure Image Fetching ---
// (Integrated directly for ease of use)
const DonationImage = ({ donationId, title }) => {
    const [imageUrl, setImageUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const fetchImage = async () => {
            try {
                // Tries to fetch image from incoming donations endpoint
                // Ensure your backend has: @GetMapping("/incomingdonations/{id}/image")
                const response = await api.get(`/mydonations/${donationId}`, {
                    responseType: 'blob' 
                });
                
                if (isMounted) {
                    const url = URL.createObjectURL(response.data);
                    setImageUrl(url);
                }
            } catch (err) {
                // Fallback: Try the general endpoint if specific one fails
                try {
                     if(isMounted) {
                        const response2 = await api.get(`/mydonations/${donationId}`, { responseType: 'blob' });
                        if (isMounted) setImageUrl(URL.createObjectURL(response2.data));
                     }
                } catch(e) {
                    if (isMounted) setError(true);
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        if (donationId) {
            fetchImage();
        }

        return () => {
            isMounted = false;
            if (imageUrl) URL.revokeObjectURL(imageUrl); // Cleanup memory
        };
    }, [donationId]);

    if (loading) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400">
                <Loader2 className="animate-spin" size={24} />
            </div>
        );
    }

    if (error || !imageUrl) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-gray-400">
                <Package size={40} strokeWidth={1.5} />
                <span className="text-xs mt-2">No Image</span>
            </div>
        );
    }

    return (
        <img 
            src={imageUrl} 
            alt={title} 
            className="w-full h-full object-cover transition-transform hover:scale-105 duration-500" 
        />
    );
};


// --- 2. Main Component ---
function Incomingdonations() {
    const [donations, setdonations] = useState([]);
    const [refresh, setrefresh] = useState(false);
    const [activeTab, setActiveTab] = useState("All");
    
    // Initialize Navigation Hook
    const navigate = useNavigate();

    const incomingdonations = async () => {
        try {
            const response = await api.get('/incomingdonations');
            setdonations(response.data);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }

    // --- Action Handlers ---
    const reject = async (id) => {
        try {
            await api.put(`/incomingdonations/${id}`, { status: "rejected" });
            setrefresh(prev => !prev);
            alert("Donation Rejected");
        } catch (error) {
            console.log(error.response?.data);
            alert("Failed to reject donation");
        }
    }

    const accept = async (id) => {
        try {
            await api.put(`/incomingdonations/${id}`, { status: "accepted" });
            setrefresh(prev => !prev);
            alert("Donation Accepted");
        } catch (error) {
            console.log(error.response?.data);
            alert("Failed to accept donation");
        }
    }

    
    const handleViewDetails = (donation) => {
        const safeId = donation.donationid || donation.id;
        navigate(`/incomingdonations/${safeId}`, { 
            state: { donation: donation } 
        });
    };

    useEffect(() => { incomingdonations(); }, [refresh]);

    const filteredDonations =
        activeTab === "All"
            ? donations
            : donations.filter((d) => d.status?.toUpperCase() === activeTab.toUpperCase());

    const getStatusStyles = (status) => {
        const safeStatus = status ? status.toUpperCase() : "PENDING";
        switch (safeStatus) {
            case "PENDING": return { border: "border-l-orange-500", badge: "bg-orange-100 text-orange-700" };
            case "ACCEPTED": return { border: "border-l-green-600", badge: "bg-green-100 text-green-700" };
            case "REJECTED": return { border: "border-l-red-500", badge: "bg-red-100 text-red-700" };
            default: return { border: "border-l-gray-400", badge: "bg-gray-100 text-gray-700" };
        }
    };

    return (
        <div className="min-h-screen bg-[#FFF8F0] p-6 md:p-12">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Incoming Requests</h1>

                {/* Filter Tabs */}
                <div className="flex space-x-6 border-b border-gray-200 mb-8 overflow-x-auto">
                    {["All", "Pending", "Accepted", "Rejected"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-3 text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === tab
                                    ? "text-green-700 border-b-2 border-green-700"
                                    : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Grid Container */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDonations.length > 0 ? (
                        filteredDonations.map((u) => {
                            const styles = getStatusStyles(u.status);
                            const status = u.status?.toUpperCase() || "PENDING";
                            const id = u.donationid || u._id; // Robust ID check

                            return (
                                <div
                                    key={id}
                                    className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden border-l-4 flex flex-col ${styles.border}`}
                                >
                                    {/* Image Section - Clickable to View Details */}
                                    <div 
                                        onClick={() => handleViewDetails(u)} 
                                        className="h-48 bg-gray-50 w-full relative border-b border-gray-100 overflow-hidden cursor-pointer group"
                                    >
                                        <DonationImage donationId={id} title={u.title} />
                                        
                                        {/* Hover Overlay */}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                            <span className="opacity-0 group-hover:opacity-100 bg-white/90 px-3 py-1 rounded-full text-xs font-bold shadow-sm transition-opacity transform translate-y-2 group-hover:translate-y-0 duration-300">
                                                View Details
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-6 flex flex-col flex-grow">
                                        <span className={`self-start px-3 py-1 rounded-full text-xs font-semibold mb-3 ${styles.badge}`}>
                                            {status}
                                        </span>

                                        <h3 className="text-xl font-bold text-gray-800 mb-1 line-clamp-1">
                                            {u.title}
                                        </h3>
                                        <h2 className="text-sm font-semibold text-gray-500 mb-3 line-clamp-1">
                                            Logistics: {u.logistics || "Not specified"}
                                        </h2>

                                        <p className="text-gray-600 text-sm mb-6 line-clamp-3 flex-grow">
                                            {u.description || "No description provided."}
                                        </p>

                                        {/* Actions Area */}
                                        <div className="mt-auto space-y-3">
                                            
                                            {/* Primary Action: View Details */}
                                            <button 
                                                onClick={() => handleViewDetails(u)}
                                                className="w-full py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors text-sm"
                                            >
                                                View Full Details
                                            </button>

                                            {/* Quick Actions (Accept/Reject) - Only if Pending */}
                                            {status === "PENDING" && (
                                                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); reject(id); }} 
                                                        className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-semibold transition-colors text-sm"
                                                    >
                                                        <X size={16} /> Reject
                                                    </button>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); accept(id); }} 
                                                        className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#2E7D32] text-white hover:bg-[#1B5E20] font-semibold shadow-md transition-colors active:scale-95 text-sm"
                                                    >
                                                        <Check size={16} /> Accept
                                                    </button>
                                                </div>
                                            )}
                                            
                                            {/* Undo Actions */}
                                            {status === "ACCEPTED" && (
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); reject(id); }} 
                                                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-semibold transition-colors text-sm"
                                                >
                                                    <X size={16} /> Undo (Reject)
                                                </button>
                                            )}
                                            {status === "REJECTED" && (
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); accept(id); }} 
                                                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#2E7D32] text-white hover:bg-[#1B5E20] font-semibold shadow-md transition-colors active:scale-95 text-sm"
                                                >
                                                    <Check size={16} /> Undo (Accept)
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400">
                            <Package size={64} className="mb-4 text-gray-300" />
                            <p className="text-lg font-medium">No donations found in "{activeTab}".</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Incomingdonations;