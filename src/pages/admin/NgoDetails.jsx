import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { 
    ArrowLeft, MapPin, Globe, Phone, ShieldCheck, 
    XCircle, CheckCircle2, FileCheck, Building2, AlertCircle, Loader2, Calendar, Mail
} from "lucide-react";
import api from "../../services/api";
import ProfileImage from "../../components/common/ProfileImage";
import NgoProofImage from "./NgoProofImage";

function NgoDetails() {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    
    // State Logic
    const [ngoData, setNgoData] = useState(location.state?.ngo || null);
    const [extraDetails, setExtraDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [status, setStatus] = useState(location.state?.ngo?.isverified || "PENDING");

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const response = await api.get(`/ngodetails/${id}`);
                setExtraDetails(response.data); 
                
                if (!ngoData && response.data.user) {
                    setNgoData(response.data.user);
                    setStatus(response.data.user.isverified);
                }
            } catch (error) {
                console.error("Failed to load details", error);
                alert("Could not load NGO details.");
                navigate('/acceptngos');
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [id]);

    const handleVerify = async (newStatus) => {
        if(!window.confirm(`Are you sure you want to ${newStatus.toLowerCase()} this NGO?`)) return;
        try {
            await api.post(`/verify/${id}`, { isverified: newStatus });
            setStatus(newStatus);
            alert(`NGO ${newStatus.toLowerCase()} successfully`);
        } catch (error) {
            alert("Action failed.");
        }
    };

    if (isLoading && !ngoData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
                <Loader2 className="animate-spin text-green-700 w-10 h-10" />
            </div>
        );
    }

    if (!ngoData) return null;

    const isVerified = status === "ACCEPTED";
    const isRejected = status === "REJECTED";

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-12">
            
            {/* Top Navigation Bar */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10 shadow-sm">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <button onClick={() => navigate('/verifyngos')} className="flex items-center text-gray-500 hover:text-green-800 transition-colors font-medium text-sm">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to List
                    </button>
                    <span className="text-sm font-semibold text-gray-400 uppercase tracking-widest">
                        Admin Verification Portal
                    </span>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 mt-8">
                
                {/* --- 1. HERO HEADER SECTION --- */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
                    {/* Gradient Cover */}
                    <div className="h-32 bg-gradient-to-r from-green-800 to-green-600 relative">
                        <div className="absolute inset-0 bg-black/10"></div>
                    </div>
                    
                    <div className="px-8 pb-8 flex flex-col md:flex-row items-center md:items-end -mt-12 gap-6">
                        {/* Profile Image with Border */}
                        <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-white overflow-hidden z-0">
                             <ProfileImage userid={id} username={ngoData.username} className="w-full h-full" />
                        </div>

                        {/* Name & Status */}
                        <div className="flex-1 text-center md:text-left mb-2">
                            <h1 className="text-3xl font-bold text-gray-900">{ngoData.username}</h1>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-2 text-sm text-gray-500">
                                <span className="flex items-center"><MapPin className="w-4 h-4 mr-1"/> {ngoData.location || "Location Unknown"}</span>
                                <span className="hidden md:inline">•</span>
                                <span className="flex items-center"><Calendar className="w-4 h-4 mr-1"/> Applied recently</span>
                            </div>
                        </div>

                        {/* Status Badge */}
                        <div className="mb-4 md:mb-2">
                            <div className={`px-4 py-2 rounded-full text-sm font-bold flex items-center shadow-sm border ${
                                isVerified ? "bg-green-50 text-green-700 border-green-200" : 
                                isRejected ? "bg-red-50 text-red-700 border-red-200" :
                                "bg-orange-50 text-orange-700 border-orange-200"
                            }`}>
                                {isVerified ? <ShieldCheck className="w-4 h-4 mr-2"/> : 
                                 isRejected ? <XCircle className="w-4 h-4 mr-2"/> : 
                                 <AlertCircle className="w-4 h-4 mr-2"/>}
                                {status}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* --- LEFT COLUMN (2/3): Proof Document --- */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800 flex items-center">
                                        <FileCheck className="w-5 h-5 mr-2 text-green-700"/> 
                                        Proof Document
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-1">Review this document carefully before verifying.</p>
                                </div>
                            </div>
                            
                            <div className="h-[600px] w-full bg-slate-100 p-8 flex items-center justify-center">
                                <div className="w-full h-full bg-white shadow-lg rounded-lg border border-gray-200 overflow-hidden relative group">
                                     <NgoProofImage userid={id} className="w-full h-full" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- RIGHT COLUMN (1/3): Sidebar Info & Actions --- */}
                    <div className="space-y-6">
                        
                        {/* 1. Action Console (Sticky) */}
                        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 sticky top-24 z-0">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2 border-gray-100">
                                Actions
                            </h3>
                            
                            {status === "PENDING" && (
                                <div className="space-y-3">
                                    <button 
                                        onClick={() => handleVerify("ACCEPTED")}
                                        className="w-full flex items-center justify-center p-3 rounded-xl bg-green-600 text-white shadow-md shadow-green-200 hover:bg-green-700 transition-all active:scale-95 font-semibold"
                                    >
                                        <CheckCircle2 className="w-5 h-5 mr-2" />
                                        Approve NGO
                                    </button>
                                    <button 
                                        onClick={() => handleVerify("REJECTED")}
                                        className="w-full flex items-center justify-center p-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all font-semibold"
                                    >
                                        <XCircle className="w-5 h-5 mr-2" />
                                        Reject NGO
                                    </button>
                                </div>
                            )}

                            {status === "ACCEPTED" && (
                                <div className="text-center p-4 bg-green-50 rounded-xl border border-green-100">
                                    <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2"/>
                                    <h4 className="font-bold text-green-800">Verified</h4>
                                    <p className="text-xs text-green-600 mb-4">This NGO is active.</p>
                                    <button onClick={() => handleVerify("REJECTED")} className="text-xs font-bold text-red-500 hover:underline">
                                        Revoke Verification
                                    </button>
                                </div>
                            )}

                             {status === "REJECTED" && (
                                <div className="text-center p-4 bg-red-50 rounded-xl border border-red-100">
                                    <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2"/>
                                    <h4 className="font-bold text-red-800">Rejected</h4>
                                    <p className="text-xs text-red-600 mb-4">Application denied.</p>
                                    <button onClick={() => handleVerify("ACCEPTED")} className="text-xs font-bold text-green-600 hover:underline">
                                        Restore & Verify
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* 2. Details Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-6">Organization Details</h3>
                            
                            {isLoading && !extraDetails ? (
                                 <div className="flex justify-center py-8"><Loader2 className="animate-spin text-gray-300"/></div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                            <Building2 size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 font-bold uppercase mb-1">License Number</p>
                                            <p className="font-medium text-gray-800 break-all bg-gray-50 px-2 py-1 rounded text-sm font-mono">
                                                {extraDetails?.licenceno || "N/A"} 
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                                            <Globe size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 font-bold uppercase mb-1">Website</p>
                                            {extraDetails?.website ? (
                                                <a href={extraDetails.website} target="_blank" rel="noreferrer" className="text-sm font-medium text-blue-600 hover:underline break-all">
                                                    {extraDetails.website}
                                                </a>
                                            ) : <span className="text-sm text-gray-500">Not Provided</span>}
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
                                            <Phone size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 font-bold uppercase mb-1">Contact Phone</p>
                                            <p className="text-sm font-medium text-gray-800">
                                                {ngoData.phone || "No phone listed"}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-600 shrink-0">
                                            <Mail size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 font-bold uppercase mb-1">Database ID</p>
                                            <p className="text-sm font-medium text-gray-800">
                                                User ID: {id}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default NgoDetails;