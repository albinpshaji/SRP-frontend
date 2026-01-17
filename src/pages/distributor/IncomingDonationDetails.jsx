import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
    ArrowLeft, MapPin, Package, Truck, Phone, User, 
    CheckCircle2, XCircle, Clock, ShieldCheck, AlertCircle 
} from "lucide-react";
import DonationImage from "../../components/common/DonationImage";
import api from "../../services/api"; // Ensure you import your API service

function IncomingDonationDetails() {
    const location = useLocation();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    
    // 1. Get Data from Router State
    const donation = location.state?.donation;

    // 2. Redirect if missing data
    if (!donation) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFF8F0] text-gray-600">
                <p className="mb-4 text-lg">No donation details found.</p>
                <button onClick={() => navigate('/incomingdonations')} className="px-6 py-2 bg-green-700 text-white rounded-lg">
                    Back to Dashboard
                </button>
            </div>
        );
    }

    // 3. Local State for Status (so UI updates immediately after Accept/Reject)
    const [currentStatus, setCurrentStatus] = useState(donation.status ? donation.status.toUpperCase() : "PENDING");

    const id = donation.donationid || donation.id;
    const donor = donation.donor || {};

    // --- Action Handlers ---
    const handleStatusUpdate = async (newStatus) => {
        setIsLoading(true);
        try {
            await api.put(`/incomingdonations/${id}`, { status: newStatus.toLowerCase() });
            setCurrentStatus(newStatus); // Update UI instantly
            alert(`Donation ${newStatus.toLowerCase()} successfully.`);
        } catch (error) {
            console.error(error);
            alert("Failed to update status.");
        } finally {
            setIsLoading(false);
        }
    };

    // --- Helper: Status Configuration ---
    const getStatusConfig = (s) => {
        switch(s) {
            case "ACCEPTED": return { bg: "bg-green-50", text: "text-green-800", border: "border-green-200", icon: <CheckCircle2 className="w-6 h-6 text-green-600" />, label: "Accepted" };
            case "REJECTED": return { bg: "bg-red-50", text: "text-red-800", border: "border-red-200", icon: <XCircle className="w-6 h-6 text-red-600" />, label: "Rejected" };
            default: return { bg: "bg-orange-50", text: "text-orange-800", border: "border-orange-200", icon: <Clock className="w-6 h-6 text-orange-600" />, label: "Pending Review" };
        }
    };

    const statusConfig = getStatusConfig(currentStatus);

    return (
        <div className="min-h-screen bg-[#FFF8F0] p-4 md:p-8 font-sans">
            
            {/* Header / Back */}
            <div className="max-w-6xl mx-auto mb-6">
                <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-green-700 font-medium transition-colors">
                    <ArrowLeft className="w-5 h-5 mr-2" /> Back to Incoming Requests
                </button>
            </div>

            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* --- LEFT COLUMN: Item Context --- */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Hero Image Card */}
                    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden relative group">
                        <div className="h-64 md:h-96 w-full bg-gray-100">
                            <DonationImage donationId={id} title={donation.title} className="w-full h-full" />
                        </div>
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-8">
                            <h1 className="text-3xl font-bold text-white mb-2">{donation.title}</h1>
                            <div className="flex gap-3">
                                <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-sm flex items-center">
                                    <Package className="w-4 h-4 mr-2" /> {donation.category || "General"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Status Banner */}
                    <div className={`${statusConfig.bg} ${statusConfig.border} border rounded-2xl p-6 flex items-center gap-4`}>
                        {statusConfig.icon}
                        <div>
                            <h3 className={`text-lg font-bold ${statusConfig.text}`}>{statusConfig.label}</h3>
                            <p className={`${statusConfig.text} opacity-80 text-sm`}>
                                {currentStatus === 'PENDING' ? "Review the donor details and logistics before accepting." : `You have ${currentStatus.toLowerCase()} this request.`}
                            </p>
                        </div>
                    </div>

                    {/* Logistics & Description */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                        <h3 className="text-xl font-bold text-gray-800 mb-6">Logistics & Condition</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                <span className="text-xs font-bold text-blue-400 uppercase">Logistics Method</span>
                                <div className="flex items-center mt-1 text-blue-900 font-semibold">
                                    <Truck className="w-5 h-5 mr-2" /> {donation.logistics}
                                </div>
                            </div>
                            {donation.pickupLocation && (
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <span className="text-xs font-bold text-gray-400 uppercase">Pickup Location</span>
                                    <div className="flex items-center mt-1 text-gray-700 font-semibold">
                                        <MapPin className="w-5 h-5 mr-2" /> {donation.pickupLocation}
                                    </div>
                                </div>
                            )}
                        </div>

                        <h4 className="font-bold text-gray-700 mb-2">Description</h4>
                        <p className="text-gray-600 leading-relaxed text-lg">
                            {donation.description || "No detailed description provided by the donor."}
                        </p>
                    </div>
                </div>

                {/* --- RIGHT COLUMN: Donor Info & Actions --- */}
                <div className="space-y-6">
                    
                    {/* 1. Donor Profile Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Donor Profile</h3>
                        
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-xl">
                                {donor.username ? donor.username[0].toUpperCase() : <User />}
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-gray-800">{donor.username || "Anonymous"}</h4>
                                <span className={`text-xs px-2 py-0.5 rounded-full flex items-center w-fit ${donor.isverified === 'ACCEPTED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                    {donor.isverified === 'ACCEPTED' ? <ShieldCheck className="w-3 h-3 mr-1"/> : <AlertCircle className="w-3 h-3 mr-1"/>}
                                    {donor.isverified === 'ACCEPTED' ? "Verified Donor" : "Unverified"}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4 text-sm text-gray-600">
                            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                                <Phone className="w-4 h-4 mr-3 text-gray-400" />
                                {currentStatus === 'ACCEPTED' ? (donor.phone || "No phone listed") : "Accept to view phone"}
                            </div>
                            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                                <MapPin className="w-4 h-4 mr-3 text-gray-400" />
                                {donor.location || "Location hidden"}
                            </div>
                        </div>
                    </div>

                    {/* 2. Action Console */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Actions</h3>
                        
                        {currentStatus === 'PENDING' && (
                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    onClick={() => handleStatusUpdate('REJECTED')}
                                    disabled={isLoading}
                                    className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-red-50 hover:border-red-100 hover:bg-red-50 text-red-600 transition-all"
                                >
                                    <XCircle className="w-6 h-6 mb-2" />
                                    <span className="font-bold">Reject</span>
                                </button>
                                <button 
                                    onClick={() => handleStatusUpdate('ACCEPTED')}
                                    disabled={isLoading}
                                    className="flex flex-col items-center justify-center p-4 rounded-xl bg-green-700 hover:bg-green-800 text-white shadow-lg shadow-green-200 transition-all active:scale-95"
                                >
                                    <CheckCircle2 className="w-6 h-6 mb-2" />
                                    <span className="font-bold">Accept</span>
                                </button>
                            </div>
                        )}

                        {currentStatus === 'ACCEPTED' && (
                            <button 
                                onClick={() => handleStatusUpdate('REJECTED')}
                                className="w-full py-3 rounded-xl border border-gray-200 text-gray-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all flex items-center justify-center font-medium"
                            >
                                <XCircle className="w-4 h-4 mr-2" /> Revoke Acceptance
                            </button>
                        )}
                         {currentStatus === 'REJECTED' && (
                            <button 
                                onClick={() => handleStatusUpdate('ACCEPTED')}
                                className="w-full py-3 rounded-xl border border-gray-200 text-gray-500 hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-all flex items-center justify-center font-medium"
                            >
                                <CheckCircle2 className="w-4 h-4 mr-2" /> Restore to Accepted
                            </button>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}

export default IncomingDonationDetails;