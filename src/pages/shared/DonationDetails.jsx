import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../../services/api";
import {
    ArrowLeft, Calendar, MapPin, Package, Truck,
    Phone, Building2, User, CheckCircle2, XCircle, Clock, Trash2
} from "lucide-react";
import DonationImage from "../../components/common/DonationImage";
import DonationChat from "../../components/chat/DonationChat";
import { useToast } from "../../context/ToastContext";

function DonationDetails() {
    const location = useLocation();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [isDeleting, setIsDeleting] = useState(false);

    // 1. Get Data safely
    const donation = location.state?.donation;

    // 2. Redirect if accessed directly without data
    if (!donation) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFF8F0] text-gray-600">
                <p className="mb-4 text-lg font-medium">No donation details found.</p>
                <button
                    onClick={() => navigate('/mydonations')}
                    className="px-6 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors"
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    const id = donation.donationid || donation.id;
    const recipient = donation.recipient || {};
    const status = donation.status ? donation.status.toUpperCase() : "PENDING";

    // Helper: Status Banner Logic
    const getStatusConfig = (s) => {
        switch (s) {
            case "ACCEPTED":
                return {
                    bg: "bg-green-50", text: "text-green-800", border: "border-green-200",
                    icon: <CheckCircle2 className="w-6 h-6 text-green-600" />,
                    label: "Donation Accepted",
                    desc: "The NGO has accepted your request. They will contact you shortly."
                };
            case "REJECTED":
                return {
                    bg: "bg-red-50", text: "text-red-800", border: "border-red-200",
                    icon: <XCircle className="w-6 h-6 text-red-600" />,
                    label: "Donation Declined",
                    desc: "This request was not accepted. Please try a different NGO or category."
                };
            default:
                return {
                    bg: "bg-orange-50", text: "text-orange-800", border: "border-orange-200",
                    icon: <Clock className="w-6 h-6 text-orange-600" />,
                    label: "Awaiting Approval",
                    desc: "Your request is currently under review by the NGO."
                };
        }
    };

    const statusConfig = getStatusConfig(status);

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this donation?")) return;

        setIsDeleting(true);
        try {
            await api.delete(`/mydonations/${id}`);
            showToast("Donation deleted successfully", "success");
            navigate('/mydonations');
        } catch (error) {
            console.error("Error deleting donation:", error);
            showToast("Failed to delete donation.", "error");
            setIsDeleting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FFF8F0] p-4 md:p-8 font-sans">

            {/* Top Navigation */}
            <div className="max-w-6xl mx-auto mb-6 flex justify-between items-center">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-gray-600 hover:text-green-700 font-medium transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Donations
                </button>

                {donation?.logistics?.deliverystatus !== "IN_TRANSIT" && donation?.logistics?.deliverystatus !== "DELIVERED" && (
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="flex items-center px-4 py-2 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {isDeleting ? "Deleting..." : "Delete Donation"}
                    </button>
                )}
            </div>

            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* --- LEFT COLUMN (Image & Key Info) --- */}
                <div className="lg:col-span-2 space-y-6">

                    {/* 1. Hero Card */}
                    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                        <div className="h-64 md:h-96 w-full relative bg-gray-100">
                            <DonationImage
                                donationId={id}
                                title={donation.title}
                                className="w-full h-full"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6 md:p-8">
                                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                                    {donation.title}
                                </h1>
                                <div className="flex items-center text-white/90 space-x-4">
                                    <span className="flex items-center bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                                        <Package className="w-4 h-4 mr-2" />
                                        {donation.category || "General Item"}
                                    </span>
                                    <span className="flex items-center bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                                        <span className="opacity-75 mr-1">ID:</span> #{id}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. Status Banner */}
                    <div className={`${statusConfig.bg} ${statusConfig.border} border rounded-2xl p-6 flex items-start space-x-4`}>
                        <div className="mt-1 flex-shrink-0">{statusConfig.icon}</div>
                        <div>
                            <h3 className={`text-lg font-bold ${statusConfig.text}`}>{statusConfig.label}</h3>
                            <p className={`${statusConfig.text} opacity-80 mt-1`}>{statusConfig.desc}</p>
                        </div>
                    </div>

                    {/* Logistics Tracking Banner */}
                    {donation.logistics?.deliverystatus && (
                        <div className={`border rounded-[1.5rem] p-5 flex items-center justify-between ${donation.logistics.deliverystatus === 'DELIVERED' ? 'bg-green-50 border-green-200' :
                            donation.logistics.deliverystatus === 'RECEIVED' ? 'bg-teal-50 border-teal-200' :
                                donation.logistics.deliverystatus === 'IN_TRANSIT' ? 'bg-blue-50 border-blue-200' :
                                    donation.logistics.deliverystatus === 'ACCEPTED' ? 'bg-purple-50 border-purple-200' :
                                        'bg-orange-50 border-orange-200'
                            }`}>
                            <div className="flex items-center space-x-4">
                                <div className={`p-4 rounded-full ${donation.logistics.deliverystatus === 'DELIVERED' ? 'bg-green-100 text-green-600' :
                                    donation.logistics.deliverystatus === 'RECEIVED' ? 'bg-teal-100 text-teal-600' :
                                        donation.logistics.deliverystatus === 'IN_TRANSIT' ? 'bg-blue-100 text-blue-600' :
                                            donation.logistics.deliverystatus === 'ACCEPTED' ? 'bg-purple-100 text-purple-600' :
                                                'bg-orange-100 text-orange-600'
                                    }`}>
                                    <Truck className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Tracking Status</p>
                                    <p className={`text-xl font-bold mt-1 tracking-tight ${donation.logistics.deliverystatus === 'DELIVERED' ? 'text-green-800' :
                                        donation.logistics.deliverystatus === 'RECEIVED' ? 'text-teal-800' :
                                            donation.logistics.deliverystatus === 'IN_TRANSIT' ? 'text-blue-800' :
                                                donation.logistics.deliverystatus === 'ACCEPTED' ? 'text-purple-800' :
                                                    'text-orange-800'
                                        }`}>
                                        {donation.logistics.deliverystatus.replace("_", " ")}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 3. Description & Details */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Item Details</h3>
                        <p className="text-gray-600 text-lg leading-relaxed mb-8">
                            {donation.description || "No specific description provided."}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Logistics Type</span>
                                <div className="flex items-center mt-2 text-gray-700 font-medium">
                                    <Truck className="w-5 h-5 mr-2 text-green-600" />
                                    {donation.logistics?.method || "Not specified"}
                                </div>
                            </div>

                            {donation.logistics?.addressLine && (
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pickup Address</span>
                                    <div className="flex items-center mt-2 text-gray-700 font-medium">
                                        <MapPin className="w-5 h-5 mr-2 text-green-600" />
                                        {donation.logistics.addressLine}
                                    </div>
                                </div>
                            )}

                            {donation.logistics?.pickupdate && (
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pickup Date</span>
                                    <div className="flex items-center mt-2 text-gray-700 font-medium">
                                        <Calendar className="w-5 h-5 mr-2 text-green-600" />
                                        {new Date(donation.logistics.pickupdate).toLocaleString()}
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>


                {/* --- RIGHT COLUMN (Sidebar Info) --- */}
                <div className="space-y-6">

                    {/* 1. Recipient (NGO) Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
                            Recipient Organization
                        </h3>

                        <div className="flex items-center space-x-4 mb-6">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-700">
                                <Building2 size={24} />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-gray-800">
                                    {recipient.username || "Unknown NGO"}
                                </h4>
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                    Verified NGO
                                </span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-start text-gray-600 text-sm">
                                <MapPin className="w-4 h-4 mr-3 mt-0.5 text-gray-400" />
                                <span>{recipient.location || "Location not listed"}</span>
                            </div>
                            <div className="flex items-center text-gray-600 text-sm">
                                <Phone className="w-4 h-4 mr-3 text-gray-400" />
                                <span>{recipient.phone || "No contact info"}</span>
                            </div>
                        </div>

                    </div>

                    <DonationChat
                        donationId={id}
                        enabled={status === "ACCEPTED"}
                        title="Chat with NGO"
                    />

                    {/* 2. My Details (Donor Info) - Read Only */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 opacity-75">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
                            Your Details (Sent)
                        </h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center text-gray-600">
                                <User className="w-4 h-4 mr-3 text-gray-400" />
                                {donation.donor?.username || "Me"}
                            </div>
                            <div className="flex items-center text-gray-600">
                                <Phone className="w-4 h-4 mr-3 text-gray-400" />
                                {donation.donor?.phone}
                            </div>
                            <div className="flex items-center text-gray-600">
                                <MapPin className="w-4 h-4 mr-3 text-gray-400" />
                                {donation.donor?.location}
                            </div>
                        </div>
                    </div>

                    {/* 3. Safety Tip */}
                    <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                        <h4 className="font-bold text-blue-800 mb-2">Safety Tip</h4>
                        <p className="text-sm text-blue-700 leading-relaxed">
                            Always verify the NGO representative's identity during pickup. Do not share financial details.
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default DonationDetails;
