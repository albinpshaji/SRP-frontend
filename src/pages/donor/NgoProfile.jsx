import { useLocation, useNavigate } from "react-router-dom";
import ProfileImage from "../../components/common/ProfileImage";
import { ArrowLeft, MapPin, Phone, ShieldCheck, Mail } from "lucide-react";

const NgoProfile = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const ngoData = location.state?.ngo;

    if (!ngoData) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFF8F0] px-6 text-center">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-100 max-w-md w-full">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-red-500 text-3xl font-bold">!</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">NGO Data Not Found</h2>
                    <p className="text-gray-500 mb-6">We couldn't load the details for this organization.</p>
                    <button
                        onClick={() => navigate('/ngos')}
                        className="w-full bg-[#2E7D32] text-white py-3 rounded-xl font-semibold hover:bg-[#1B5E20] transition-colors"
                    >
                        Back to NGOs List
                    </button>
                </div>
            </div>
        );
    }

    const isVerified = ngoData.isverified === "ACCEPTED";

    const handleDonate = () => {
        navigate(`/donate/${ngoData.userid}`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#FFF8F0] to-[#E8F5E9] py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Back Navigation */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-gray-600 hover:text-green-700 font-medium mb-6 transition-colors group px-2"
                >
                    <ArrowLeft className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" />
                    Back to NGOs
                </button>

                {/* Main Content Card */}
                <div style={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)' }} className="bg-white/90 backdrop-blur-xl rounded-[2rem] overflow-hidden border border-white/50 relative">

                    {/* Header Banner - Subtle Green Gradient */}
                    <div className="h-40 md:h-52 bg-gradient-to-r from-[#1e5221] via-[#2E7D32] to-[#3a983e] relative overflow-hidden">
                        <div className="absolute inset-0 bg-black/10"></div>
                        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="absolute top-0 right-1/4 w-48 h-48 bg-green-200/20 rounded-full blur-2xl transform"></div>
                    </div>

                    {/* Content Section */}
                    <div className="px-6 sm:px-10 pb-12">

                        {/* Avatar & Action Button Row */}
                        <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-20 md:-mt-24 mb-8 gap-6 md:gap-0">

                            {/* Avatar */}
                            <div className="relative inline-block z-10 self-center md:self-auto">
                                <div className="p-1.5 bg-white rounded-[2rem] shadow-lg">
                                    <ProfileImage
                                        userid={ngoData.userid}
                                        username={ngoData.username}
                                        className="w-32 h-32 md:w-40 md:h-40 rounded-[1.75rem] border-4 border-white object-cover"
                                    />
                                    {isVerified && (
                                        <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-1.5 rounded-full border-4 border-white shadow-sm" title="Verified NGO">
                                            <ShieldCheck className="w-5 h-5" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Primary Action Button */}
                            <div className="w-full md:w-auto md:pl-6 self-center md:self-end mt-4 mb-2 md:mb-0">
                                <button
                                    onClick={handleDonate}
                                    className="w-full md:w-auto px-8 py-3.5 bg-[#2E7D32] text-white rounded-xl font-bold text-lg hover:bg-[#1B5E20] transition-colors shadow-lg active:scale-95 flex items-center justify-center gap-2"
                                >
                                    Donate Now
                                </button>
                            </div>
                        </div>

                        {/* Title & Status */}
                        <div className="text-center md:text-left mb-10">
                            <h1 className="text-3xl md:text-4xl font-extrabold text-[#111827] mb-3 tracking-tight capitalize">
                                {ngoData.username}
                            </h1>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-50/80 text-green-700 text-sm font-bold border border-green-100 shadow-sm">
                                    {ngoData.role}
                                </div>
                                {isVerified ? (
                                    <span className="inline-flex items-center text-sm font-medium text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                                        <ShieldCheck className="w-4 h-4 mr-1.5" /> Verified Target
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center text-sm font-medium text-orange-700 bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
                                        Verification Pending
                                    </span>
                                )}
                            </div>
                        </div>

                        <hr className="border-gray-100 mb-8" />

                        {/* Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Contact Card */}
                            <div className="group bg-[#fcfdfd] p-6 rounded-2xl border border-gray-100 hover:border-green-200 hover:shadow-md transition-all duration-300 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-green-50 to-transparent rounded-bl-full opacity-50"></div>

                                <div className="flex items-start gap-4 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-green-100/50 flex flex-shrink-0 items-center justify-center text-green-700">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-1">Contact Phone</p>
                                        <p className="text-lg font-medium text-gray-800">{ngoData.phone || "Not available"}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Location Card */}
                            <div className="group bg-[#fcfdfd] p-6 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-300 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-50 to-transparent rounded-bl-full opacity-50"></div>

                                <div className="flex items-start gap-4 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-100/50 flex flex-shrink-0 items-center justify-center text-blue-700">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-1">Primary Location</p>
                                        <p className="text-lg font-medium text-gray-800 leading-tight">{ngoData.location || "Not specified"}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Removed Identity Card (User ID) */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NgoProfile;
