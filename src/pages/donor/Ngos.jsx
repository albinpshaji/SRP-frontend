import { useState, useEffect, useRef, useCallback } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import { MapPin, Search, Loader2 } from "lucide-react";
import ProfileImage from "../../components/common/ProfileImage";

function Ngos() {
    const [ngos, setNgos] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [cursor, setCursor] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const observer = useRef();

    const lastElementRef = useCallback(node => {

        if (loading) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                fetchMoreData();
            }
        });

        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    useEffect(() => {
        const delay = setTimeout(() => {
            setNgos([]);
            setCursor(0);
            setHasMore(true);
            fetchInitial(searchTerm);
        }, 500);
        return () => clearTimeout(delay);
    }, [searchTerm]);


    const fetchInitial = async (query) => {
        setLoading(true);
        try {
            const res = await api.get(`/ngos?keyword=${query}&lastid=0&size=1`);
            setNgos(res.data.content);
            setCursor(res.data.nextCursor);
            setHasMore(res.data.hasMore);
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMoreData = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/ngos?keyword=${searchTerm}&lastid=${cursor}&size=1`);
            setNgos(prev => [...prev, ...res.data.content]);
            setCursor(res.data.nextCursor);
            setHasMore(res.data.hasMore);
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDonateClick = (id) => {
        navigate(`/donate/${id}`);
    };

    const handleViewDetails = (u) => {
        navigate(`/ngos/${u.userid}`, { state: { ngo: u } });
    };

    return (
        <div className="min-h-screen bg-[#FFF8F0] p-6 md:p-12">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-8 ">NGOS</h1>

                <div className="relative w-full md:w-1/2 mb-10">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search NGOs by name or location..."
                        className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-green-600 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {ngos.map((u, index) => {

                        if (ngos.length === index + 1) {
                            return (
                                <div ref={lastElementRef} key={u.userid}>
                                    <NgoCard u={u} onDonate={handleDonateClick} onView={handleViewDetails} />
                                </div>
                            );
                        } else {
                            return <NgoCard key={u.userid} u={u} onDonate={handleDonateClick} onView={handleViewDetails} />;
                        }
                    })}
                </div>

                {loading && (
                    <div className="flex justify-center py-10">
                        <Loader2 className="animate-spin text-green-700 w-10 h-10" />
                    </div>
                )}

                {!hasMore && ngos.length > 0 && (
                    <p className="text-center text-gray-400 mt-10 italic">You've reached the end of the list.</p>
                )}

                {!loading && ngos.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
                        <p className="text-gray-500 text-xl">No NGOs found matching your search.</p>
                    </div>
                )}
            </div>
        </div>
    );
}


function NgoCard({ u, onDonate, onView }) {
    return (
        <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full border border-gray-100">

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



                <div className="mt-auto grid grid-cols-2 gap-3 pt-4 border-t border-gray-50">
                    <button
                        onClick={() => onView(u)}
                        className="w-full bg-white text-[#2E7D32] border-2 border-[#2E7D32] py-2.5 rounded-xl font-bold text-sm hover:bg-green-50 transition-colors active:scale-[0.98]"
                    >
                        View Details
                    </button>
                    <button
                        onClick={() => onDonate(u.userid)}
                        className="w-full bg-[#2E7D32] text-white py-2.5 rounded-xl font-bold text-sm hover:bg-[#1B5E20] transition-colors shadow-sm shadow-green-200 active:scale-[0.98]"
                    >
                        Donate
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Ngos;