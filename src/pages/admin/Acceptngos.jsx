import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useEffect, useState } from "react";
import { Check, X, Building2, ShieldCheck, ShieldAlert, Ban, Eye } from "lucide-react";
import ProfileImage from "../../components/common/ProfileImage"; 

function Acceptngos() {
    const [ngos, setngos] = useState([]);
    const [refresh, setrefresh] = useState(false);
    const [activeTab, setActiveTab] = useState("All");
    const navigate = useNavigate();

    const showallngos = async () => {
        try {
            const ngos = await api.get('/allngos');
            setngos(ngos.data);
        } catch (error) {
            console.log("Error fetching NGOs");
        }
    }

    const acceptngos = async (id) => {
        try {
            await api.post(`/verify/${id}`, { isverified: "ACCEPTED" });
            setrefresh(prev => !prev);
        } catch (error) {
            console.log("Error accepting");
        }
    }

    const rejectngos = async (id) => {
        try {
            await api.post(`/verify/${id}`, { isverified: "REJECTED" });
            setrefresh(prev => !prev);
        } catch (error) {
            console.log("Error rejecting");
        }
    }

    useEffect(() => { showallngos(); }, [refresh]);

    const filteredNgos =
        activeTab === "All"
            ? ngos
            : ngos.filter((ngo) => {
                const status = ngo.isverified ? ngo.isverified.toUpperCase() : "PENDING";
                if (activeTab === "Verified") return status === "ACCEPTED";
                return status === activeTab.toUpperCase();
            });

    const getStatusStyles = (status) => {
        const safeStatus = status ? status.toUpperCase() : "PENDING";
        switch (safeStatus) {
            case "PENDING": return { border: "border-l-orange-500", badge: "bg-orange-100 text-orange-700", icon: <ShieldAlert size={16} />, label: "PENDING" };
            case "ACCEPTED": return { border: "border-l-green-600", badge: "bg-green-100 text-green-700", icon: <ShieldCheck size={16} />, label: "VERIFIED" };
            case "REJECTED": return { border: "border-l-red-500", badge: "bg-red-100 text-red-700", icon: <Ban size={16} />, label: "REJECTED" };
            default: return { border: "border-l-gray-400", badge: "bg-gray-100 text-gray-700", icon: <Building2 size={16} />, label: "UNKNOWN" };
        }
    };

    return (
        <div className="min-h-screen bg-[#FFF8F0] p-6 md:p-12">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Verify NGOs</h1>

                {/* Filter Tabs */}
                <div className="flex space-x-6 border-b border-gray-200 mb-8 overflow-x-auto">
                    {["All", "Pending", "Verified", "Rejected"].map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-3 text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === tab ? "text-green-700 border-b-2 border-green-700" : "text-gray-500 hover:text-gray-700"}`}>
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredNgos.length > 0 ? (
                        filteredNgos.map((u) => {
                            const rawStatus = u.isverified || "PENDING";
                            const styles = getStatusStyles(rawStatus);
                            const statusUpper = rawStatus.toUpperCase();

                            return (
                                <div key={u.userid} className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden border-l-4 flex flex-col ${styles.border}`}>
                                    <div className="h-40 bg-gray-50 w-full relative flex items-center justify-center border-b border-gray-100 overflow-hidden">
                                        <ProfileImage userid={u.userid} username={u.username} className="w-full h-full" />
                                    </div>

                                    <div className="p-6 flex flex-col flex-grow">
                                        <span className={`self-start px-3 py-1 rounded-full text-xs font-semibold mb-3 flex items-center gap-1 ${styles.badge}`}>
                                            {styles.icon} {styles.label}
                                        </span>
                                        <h3 className="text-xl font-bold text-gray-800 mb-1 line-clamp-1">{u.username}</h3>
                                        <p className="text-gray-500 text-xs mb-4">ID: {u.userid}</p>

                                        <div className="mt-auto">
                                            {/* VIEW BUTTON WITH ID IN URL */}
                                            <button 
                                                onClick={() => navigate(`/verifyngos/ngodetails/${u.userid}`, { state: { ngo: u } })} 
                                                className="w-full flex items-center justify-center gap-2 mb-3 px-4 py-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold transition-colors text-sm border border-blue-100"
                                            >
                                                <Eye size={16} /> View Profile & Proof
                                            </button>

                                            {/* Action Buttons */}
                                            {statusUpper === "PENDING" && (
                                                <div className="grid grid-cols-2 gap-3">
                                                    <button onClick={() => rejectngos(u.userid)} className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-semibold text-sm"><X size={16} /> Reject</button>
                                                    <button onClick={() => acceptngos(u.userid)} className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#2E7D32] text-white hover:bg-[#1B5E20] font-semibold text-sm"><Check size={16} /> Accept</button>
                                                </div>
                                            )}
                                            {statusUpper === "ACCEPTED" && (
                                                <button onClick={() => rejectngos(u.userid)} className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-semibold text-sm"><X size={16} /> Revoke Verification</button>
                                            )}
                                            {statusUpper === "REJECTED" && (
                                                <button onClick={() => acceptngos(u.userid)} className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#2E7D32] text-white hover:bg-[#1B5E20] font-semibold text-sm"><Check size={16} /> Restore & Verify</button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400">
                            <Building2 size={64} className="mb-4 text-gray-300" />
                            <p className="text-lg font-medium">No NGOs found in "{activeTab}".</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
export default Acceptngos;