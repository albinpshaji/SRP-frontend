import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { Truck, MapPin, Calendar, Package, RefreshCw, User } from "lucide-react";
import DonationImage from "../../components/common/DonationImage";

const statusColors = {
    PENDING: "bg-orange-100 text-orange-800",
    ACCEPTED: "bg-purple-100 text-purple-800",
    IN_TRANSIT: "bg-blue-100 text-blue-800",
    DELIVERED: "bg-green-100 text-green-800",
    RECEIVED: "bg-teal-100 text-teal-800",
};

function Logistics() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);
    const navigate = useNavigate();

    const fetchLogistics = async () => {
        try {
            const res = await api.get("/logistics");
            setItems(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Failed to fetch logistics:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchLogistics(); }, []);

    const handleStatusUpdate = async (logisticsid, newStatus) => {
        setUpdatingId(logisticsid);
        try {
            await api.put(`/logistics/${logisticsid}`, { deliverystatus: newStatus });
            setItems(prev =>
                prev.map(l => l.logisticsid === logisticsid ? { ...l, deliverystatus: newStatus } : l)
            );
        } catch (err) {
            alert("Failed to update status.");
        } finally {
            setUpdatingId(null);
        }
    };

    const handleViewDetails = (donationId) => {
        if (donationId) {
            navigate(`/logistics/${donationId}`);
        }
    };

    const getNextStatus = (current, method) => {
        const isDropoff = method?.toLowerCase().includes("drop");
        const flow = isDropoff
            ? ["PENDING", "ACCEPTED", "RECEIVED"]
            : ["PENDING", "ACCEPTED", "IN_TRANSIT", "DELIVERED"];

        const idx = flow.indexOf(current?.toUpperCase());
        return idx !== -1 && idx < flow.length - 1 ? flow[idx + 1] : null;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center">
                <p className="text-gray-500 text-lg animate-pulse">Loading logistics...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FFF8F0] p-6 md:p-12">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Logistics Management</h1>
                        <p className="text-gray-500 mt-1">Track and update delivery status for all incoming donations.</p>
                    </div>
                    <button
                        onClick={fetchLogistics}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:text-green-700 hover:border-green-300 transition-all text-sm font-medium shadow-sm"
                    >
                        <RefreshCw className="w-4 h-4" /> Refresh
                    </button>
                </div>

                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-dashed border-gray-300">
                        <Package size={64} className="text-gray-200 mb-4" />
                        <p className="text-gray-500 text-lg font-medium">No logistics records found.</p>
                        <p className="text-gray-400 text-sm mt-1">Accepted donations with pickup/drop-off logistics will appear here.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items.map((item) => {
                            const status = item.deliverystatus?.toUpperCase() || "PENDING";
                            const nextStatus = getNextStatus(status, item.method);
                            const isUpdating = updatingId === item.logisticsid;

                            return (
                                <div key={item.logisticsid} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all flex flex-col">

                                    {/* Image Section */}
                                    {item.donationId && (
                                        <div
                                            className="h-48 w-full relative bg-gray-50 border-b border-gray-100 flex-shrink-0 overflow-hidden z-0 cursor-pointer group"
                                            onClick={() => handleViewDetails(item.donationId)}
                                        >
                                            <DonationImage donationId={item.donationId} title={item.donationTitle} className="w-full h-full object-cover" />
                                            {/* Hover Overlay */}
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                                <span className="opacity-0 group-hover:opacity-100 bg-white/95 px-4 py-1.5 rounded-full text-xs font-bold shadow-lg text-gray-800 transition-all transform translate-y-2 group-hover:translate-y-0 duration-300">
                                                    View Details
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Status banner */}
                                    <div className={`px-5 py-3 flex items-center justify-between z-10 relative ${statusColors[status] || "bg-gray-100 text-gray-700"}`}>
                                        <span className="text-xs font-bold uppercase tracking-widest">{status.replace("_", " ")}</span>
                                        <Truck className="w-4 h-4 opacity-70" />
                                    </div>

                                    <div className="p-5 flex flex-col flex-grow gap-4">
                                        {/* Donation Context */}
                                        {item.donationTitle && (
                                            <div className="mb-2 border-b border-gray-50 pb-4">
                                                <h3 className="text-xl font-bold text-gray-800 line-clamp-2 leading-tight pt-1">{item.donationTitle}</h3>
                                                <div className="flex items-center gap-3 mt-2 text-sm text-gray-500 font-medium">
                                                    <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">{item.category || "General Item"}</span>
                                                    {item.donorUsername && (
                                                        <span className="flex items-center gap-1">
                                                            <User className="w-3.5 h-3.5" />
                                                            {item.donorUsername}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        {/* Method */}
                                        <div>
                                            <span className="text-xs font-semibold text-gray-400 uppercase">Method</span>
                                            <p className="font-semibold text-gray-800 mt-0.5">{item.method || "—"}</p>
                                        </div>


                                        {item.addressLine && (
                                            <div className="flex items-start gap-2 text-sm text-gray-600">
                                                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                                <span>{item.addressLine}</span>
                                            </div>
                                        )}

                                        {/* Pickup Date */}
                                        {item.pickupdate && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                <span>{new Date(item.pickupdate).toLocaleString()}</span>
                                            </div>
                                        )}

                                        {/* Timestamps */}
                                        <div className="text-xs text-gray-400 border-t border-gray-50 pt-3">
                                            <p>Created: {new Date(item.createdAt).toLocaleDateString()}</p>
                                            {item.updatedBy && (
                                                <p className="mt-0.5">Last updated by: <span className="font-medium text-gray-500">{item.updatedBy.username}</span></p>
                                            )}
                                        </div>

                                        {/* Advance Status Button */}
                                        {nextStatus && (
                                            <button
                                                onClick={() => handleStatusUpdate(item.logisticsid, nextStatus)}
                                                disabled={isUpdating}
                                                className="mt-auto w-full py-2.5 rounded-xl bg-[#2E7D32] text-white font-semibold text-sm hover:bg-[#1B5E20] transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-green-200"
                                            >
                                                {isUpdating ? "Updating..." : `Mark as ${nextStatus.replace("_", " ")}`}
                                            </button>
                                        )}

                                        {(status === "DELIVERED" || status === "RECEIVED") && (
                                            <div className="mt-auto w-full py-2.5 rounded-xl bg-green-50 text-green-700 font-semibold text-sm text-center border border-green-200">
                                                ✓ {status === "RECEIVED" ? "Received" : "Delivered"}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Logistics;
