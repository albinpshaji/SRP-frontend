import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft, MapPin, Package, Truck, Phone, User,
    CheckCircle2, Clock, ShieldCheck, AlertCircle
} from "lucide-react";
import DonationImage from "../../components/common/DonationImage";
import api from "../../services/api";

function LogisticsDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [donation, setDonation] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDetails = async () => {
            if (!id) return;
            setIsLoading(true);
            try {
                // Fetch the full incoming donations list (since the single GET endpoint had spring routing issues)
                // and find the specific one by ID. This ensures data is definitely fetched securely.
                const res = await api.get("/incomingdonations");
                const found = res.data.find(d => (d.donationid || d._id || d.id).toString() === id.toString());

                if (found) {
                    setDonation(found);
                } else {
                    setError("Details for this donation could not be found.");
                }
            } catch (err) {
                console.error("Failed to fetch details:", err);
                setError("Failed to load details. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchDetails();
    }, [id]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FFF8F0]">
                <p className="text-gray-500 animate-pulse text-lg font-medium">Loading details...</p>
            </div>
        );
    }

    if (error || !donation) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFF8F0] text-gray-600">
                <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
                <p className="mb-6 text-lg font-medium">{error || "No donation details found."}</p>
                <button onClick={() => navigate('/logistics')} className="px-6 py-2.5 bg-green-700 hover:bg-green-800 transition-colors text-white font-medium rounded-xl shadow-sm cursor-pointer">
                    Back to Logistics
                </button>
            </div>
        );
    }

    const donor = donation.donor || {};
    const logistics = donation.logistics || {};

    return (
        <div className="min-h-screen bg-[#FFF8F0] p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6 flex flex-col pt-[70px]">

                {/* Header Actions */}
                <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <button
                        onClick={() => navigate('/logistics')}
                        className="flex items-center text-gray-600 hover:text-green-700 font-medium transition-colors bg-gray-50 hover:bg-green-50 px-4 py-2 rounded-xl cursor-pointer"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" /> Back
                    </button>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">ID:</span>
                        <span className="text-sm font-mono bg-gray-100 px-3 py-1 rounded-lg text-gray-600">{id}</span>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left Column: Image & Status */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="h-64 w-full relative bg-gray-50">
                                <DonationImage donationId={id} title={donation.title || "Donation Item"} />
                            </div>
                            <div className="p-5 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                                <span className="text-sm font-bold text-gray-500 uppercase">Donation Status</span>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${donation.status === "PENDING" ? "bg-orange-100 text-orange-700" :
                                    donation.status === "ACCEPTED" ? "bg-green-100 text-green-700" :
                                        "bg-red-100 text-red-700"
                                    }`}>
                                    {donation.status || "UNKNOWN"}
                                </span>
                            </div>
                        </div>

                        {/* Donor Info Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <User className="w-4 h-4" /> Donor Information
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Name / Username</p>
                                    <p className="font-semibold text-gray-800">{donor.username || "Anonymous"}</p>
                                </div>
                                {donor.phone && (
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                                            <Phone className="w-3.5 h-3.5" /> Contact Number
                                        </p>
                                        <p className="font-semibold text-gray-800">{donor.phone}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Details */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Title & Description */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8">
                            <div className="flex items-start justify-between gap-4 mb-6">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-800 mb-2">{donation.title}</h1>
                                    <span className="inline-block bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-sm font-medium">
                                        {donation.category || "General"}
                                    </span>
                                </div>
                            </div>

                            <div className="prose prose-gray max-w-none">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Description</h3>
                                <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    {donation.description || "No description provided."}
                                </p>
                            </div>
                        </div>

                        {/* Logistics Section */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    <Truck className="w-5 h-5 text-green-600" /> Logistics Details
                                </h3>
                            </div>

                            <div className="p-6">
                                {Object.keys(logistics).length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1 font-medium">Delivery Method</p>
                                            <div className="flex items-center gap-2">
                                                <Package className="w-4 h-4 text-gray-400" />
                                                <p className="font-semibold text-gray-800">{logistics.method || "Not Specified"}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-sm text-gray-500 mb-1 font-medium">Current Status</p>
                                            <span className={`inline-block px-3 py-1 rounded-lg text-sm font-bold uppercase ${logistics.deliverystatus === "DELIVERED" || logistics.deliverystatus === "RECEIVED" ? "bg-green-100 text-green-700" :
                                                logistics.deliverystatus === "IN_TRANSIT" ? "bg-blue-100 text-blue-700" :
                                                    "bg-orange-100 text-orange-700"
                                                }`}>
                                                {logistics.deliverystatus || "PENDING"}
                                            </span>
                                        </div>

                                        {logistics.addressLine && (
                                            <div className="sm:col-span-2">
                                                <p className="text-sm text-gray-500 mb-1 font-medium">Pickup/Dropoff Address</p>
                                                <div className="flex items-start gap-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                                                    <p className="font-medium text-gray-700 leading-relaxed">{logistics.addressLine}</p>
                                                </div>
                                            </div>
                                        )}

                                        {logistics.pickupdate && (
                                            <div className="sm:col-span-2">
                                                <p className="text-sm text-gray-500 mb-1 font-medium">Scheduled Date</p>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-gray-400" />
                                                    <p className="font-medium text-gray-800">{new Date(logistics.pickupdate).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Info className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500">No logistics information has been arranged yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default LogisticsDetails;
