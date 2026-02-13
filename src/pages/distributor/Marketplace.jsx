import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api"; 
import DonationImage from "../../components/common/DonationImage"; 
import { ArrowRight } from "lucide-react";

function Marketplace() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("All");

    const navigate = useNavigate();

    const fetchMarketplaceItems = async () => {
        try {
            const response = await api.get('/getmarketplaceitems');
            const data = Array.isArray(response.data) ? response.data : [response.data];
            setItems(data);
        } catch (error) {
            console.error("Error loading marketplace:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchMarketplaceItems(); }, []);

    // Navigate to Details Page
    const handleViewDetails = (item) => {
        const id = item.donationid || item.id;
        navigate(`/marketplace/${id}`, { state: { donation: item } });
    };

    const filteredItems = filter === "All" 
        ? items 
        : items.filter(item => item.category === filter);

    const categories = ["All", "Food", "Clothes", "Medicine", "Books", "Electronics", "Other"];

    return (
        <div className="min-h-screen bg-[#FFF8F0] p-6 md:p-12">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Donation Marketplace</h1>
                        <p className="text-gray-500 mt-1">Select items available for donation.</p>
                    </div>
                </div>
                
                {/* Category Filters */}
                <div className="flex space-x-4 border-b border-gray-200 mb-8 overflow-x-auto pb-2">
                    {categories.map((cat) => (
                        <button 
                            key={cat} 
                            onClick={() => setFilter(cat)} 
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap 
                                ${filter === cat 
                                    ? "bg-green-700 text-white shadow-md" 
                                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="text-center py-20 text-gray-500">Loading marketplace...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredItems.length > 0 ? (
                            filteredItems.map((item) => {
                                const isPickup = item.logistics === "Pickup";
                                const locationDisplay = isPickup ? item.pickupLocation : "Donor will deliver (Drop-off)";
                                const logisticsLabel = isPickup ? "Pickup Required" : "Drop-off";
                                const logisticsColor = isPickup ? "text-orange-700 bg-orange-50" : "text-blue-700 bg-blue-50";

                                return (
                                    <div key={item.donationid} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all overflow-hidden flex flex-col h-full border border-gray-100">
                                        
                                        {/* Image */}
                                        <div className="h-56 w-full relative bg-gray-100">
                                            <DonationImage donationId={item.donationid} title={item.title} className="w-full h-full object-cover" />
                                            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-green-800 shadow-sm">
                                                {item.category}
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-6 flex flex-col flex-grow">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-xl font-bold text-gray-800">{item.title}</h3>
                                            </div>
                                            
                                            {/* REMOVED DESCRIPTION AS REQUESTED */}

                                            {/* Logistics & Location Section */}
                                            <div className={`flex flex-col gap-1 text-sm mb-6 p-3 rounded-lg ${logisticsColor} mt-auto`}>
                                                <div className="flex items-center gap-2 font-semibold">
                                                    {isPickup ? (
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
                                                    ) : (
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                                                    )}
                                                    <span>{logisticsLabel}</span>
                                                </div>
                                                <div className="flex items-start gap-2 ml-6 opacity-90">
                                                    <span className="truncate" title={locationDisplay}>
                                                        {locationDisplay}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* View Details Button */}
                                            <button 
                                                onClick={() => handleViewDetails(item)}
                                                className="w-full flex items-center justify-center gap-2 bg-[#2E7D32] text-white py-3 rounded-lg font-bold hover:bg-[#1B5E20] transition-colors shadow-md active:scale-[0.98]"
                                            >
                                                View Details <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
                                <p className="text-gray-500 text-lg">No items found in this category.</p>
                                <button onClick={() => setFilter("All")} className="text-green-600 font-semibold mt-2 hover:underline">View all items</button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Marketplace;