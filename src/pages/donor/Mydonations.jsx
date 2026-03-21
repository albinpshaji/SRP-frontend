import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import DonationImage from "../../components/common/DonationImage";

function Mydonations() {
    const [donations, setdonations] = useState([]);
    const [activeTab, setActiveTab] = useState("All");

    const navigate = useNavigate();

    const getmydonations = async () => {
        try {
            const donationResponse = await api.get('/mydonations');
            setdonations(donationResponse.data);
        } catch (error) {
            console.log("Error loading donations:", error);
        }
    }

    useEffect(() => { getmydonations(); }, []);

    const getEffectiveStatus = (donation) => {
        if (donation.status?.toUpperCase() === "REJECTED") return "REJECTED";
        if (donation.status?.toUpperCase() === "PENDING") return "PENDING";

        // If it's accepted, the logistics status is more informative
        if (donation.status?.toUpperCase() === "ACCEPTED" && donation.logistics?.deliverystatus) {
            return donation.logistics.deliverystatus.toUpperCase();
        }
        return donation.status?.toUpperCase() || "UNKNOWN";
    };

    const filteredDonations = donations.filter((d) => {
        if (activeTab === "All") return true;
        const tabKey = activeTab.replace(" ", "_").toUpperCase();

        const status = getEffectiveStatus(d);
        if (tabKey === "DELIVERED" && (status === "DELIVERED" || status === "RECEIVED")) return true;

        return status === tabKey;
    });

    const getStatusStyles = (status) => {
        switch (status?.toUpperCase()) {
            case "PENDING": return { border: "border-l-orange-500", badge: "bg-orange-100 text-orange-800" };
            case "ACCEPTED": return { border: "border-l-purple-500", badge: "bg-purple-100 text-purple-800" };
            case "IN_TRANSIT": return { border: "border-l-blue-500", badge: "bg-blue-100 text-blue-800" };
            case "DELIVERED": return { border: "border-l-green-500", badge: "bg-green-100 text-green-800" };
            case "RECEIVED": return { border: "border-l-teal-500", badge: "bg-teal-100 text-teal-800" };
            case "REJECTED": return { border: "border-l-red-500", badge: "bg-red-100 text-red-800" };
            default: return { border: "border-l-gray-400", badge: "bg-gray-100 text-gray-700" };
        }
    };

    const handleview = (don) => {
        navigate(`/mydonations/${don.donationid || don.id}`, { state: { donation: don } });
    }

    return (
        <div className="min-h-screen bg-[#FFF8F0] p-4 md:p-12">
            <div className="max-w-7xl mx-auto">
                {/* Header with Title and List Button */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <h1 className="text-3xl font-bold text-gray-800">My Donations</h1>
                    <button
                        onClick={() => navigate('/marketplace/list')}
                        className="bg-[#2E7D32] hover:bg-[#1B5E20] text-white px-6 py-3 rounded-lg font-semibold shadow-md transition-all active:scale-95 flex items-center gap-2"
                    >
                        <span>+</span> List Item to Marketplace
                    </button>
                </div>

                <div className="flex space-x-6 border-b border-gray-200 mb-8 overflow-x-auto scroolbar-hide">
                    {["All", "Pending", "Accepted", "In Transit", "Delivered", "Rejected"].map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-3 text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === tab ? "text-green-700 border-b-2 border-green-700" : "text-gray-500 hover:text-gray-700"}`}>{tab}</button>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDonations.length > 0 ? (
                        filteredDonations.map((donation) => {
                            const effectiveStatus = getEffectiveStatus(donation);
                            const styles = getStatusStyles(effectiveStatus);
                            const id = donation.donationid || donation.id;

                            return (
                                <div key={id} className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border-l-4 ${styles.border}`}>

                                    <div className="h-48 w-full relative">
                                        <DonationImage donationId={id} title={donation.title} className="w-full h-full" />
                                    </div>

                                    <div className="p-5">
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${styles.badge}`}>
                                            {effectiveStatus.replace("_", " ")}
                                        </span>
                                        <h3 className="text-xl font-bold text-gray-800 mb-1">{donation.title}</h3>
                                        <p className="text-gray-500 text-sm mb-4 line-clamp-2">{donation.description}</p>

                                        <button
                                            onClick={() => handleview(donation)}
                                            className="w-full bg-[#2E7D32] text-white py-2.5 rounded-lg font-medium hover:bg-[#1B5E20] transition-colors shadow-sm active:scale-[0.98]"
                                        >
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-gray-500 col-span-full text-center py-10">No donations found in this category.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Mydonations;
