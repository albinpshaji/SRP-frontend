import { useState, useEffect } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import { MapPin, Search } from "lucide-react"; 
import ProfileImage from "../../components/common/ProfileImage";

function Ngos() {
    const [ngos, setngos] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false); 
    const navigate = useNavigate();

    const fetchNgos = async (query = "") => {
        setLoading(true);
        try {
            const endpoint = query ? `/ngos?keyword=${query}` : '/ngos';
            const response = await api.get(endpoint);
            setngos(response.data);
        } catch (error) {
            console.log('Error fetching NGOs:', error);
        } finally {
            setLoading(false);
        }
    }

    const handledonate = (id) => {
        navigate(`/donate/${id}`);
    }

    // Debounce Logic: Wait 500ms after user stops typing to call API
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchNgos(searchTerm);
        }, 500); 

        // Cleanup function to cancel the timeout if user types again before 500ms
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]); 

    return (
        <div className="min-h-screen bg-[#FFF8F0] p-6 md:p-12">
            <div className="max-w-7xl mx-auto">
                
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Browse NGOs</h1>

                {/* Search Bar */}
                <div className="flex flex-col md:flex-row gap-4 mb-10 justify-between items-center">
                    <div className="w-full md:w-1/2 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input 
                            type="text" 
                            placeholder="Search NGOs..." 
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-600 outline-none transition-all shadow-sm bg-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Loading State */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
                    </div>
                ) : (
                    /* NGO Grid */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {ngos.length > 0 ? (
                            ngos.map((u) => (
                                <div
                                    key={u.userid}
                                    className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
                                >
                                    <div className="h-48 w-full relative">
                                        <ProfileImage 
                                            userid={u.userid} 
                                            username={u.username} 
                                            className="w-full h-full object-cover" 
                                        />
                                    </div>

                                    <div className="p-6 flex flex-col flex-grow">
                                        <h2 className="text-xl font-bold text-gray-900 mb-2">
                                            {u.username}
                                        </h2>

                                        <div className="flex items-center text-gray-500 mb-3 text-sm">
                                            <MapPin className="w-4 h-4 mr-1" />
                                            <span>{u.location || "Location not provided"}</span>
                                        </div>

                                        <div className="mb-6">
                                            <span className="text-sm font-bold text-gray-800">Needs: </span>
                                            <span className="text-sm text-gray-600">
                                                {u.needs || "Financial Support, Supplies"}
                                            </span>
                                        </div>

                                        <div className="mt-auto">
                                            <button
                                                onClick={() => handledonate(u.userid)}
                                                className="w-full bg-[#2E7D32] text-white py-3 rounded-xl font-bold text-lg hover:bg-[#1B5E20] transition-transform active:scale-[0.98] shadow-md"
                                            >
                                                Donate
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-10">
                                <p className="text-gray-500 text-lg">No NGOs found matching "{searchTerm}"</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Ngos;