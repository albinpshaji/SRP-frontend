import { useState, useEffect, useRef, useCallback } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import { MapPin, Search, Loader2, Map as MapIcon, List, Navigation } from "lucide-react";
import ProfileImage from "../../components/common/ProfileImage";
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom Donor Icon using standard Leaflet DivIcon
const donorIcon = new L.divIcon({
    className: 'custom-donor-icon',
    html: `<div style="background-color: #2E7D32; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
           </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
});

function Ngos() {
    const [ngos, setNgos] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [cursor, setCursor] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    // Dynamic map centering component
    function MapController({ lat, lon }) {
        const map = useMap();
        useEffect(() => {
            if (lat !== null && lon !== null) {
                // Zoom level 12-13 roughly captures a 15km radius depending on screen size
                map.setView([lat, lon], 12);
            }
        }, [lat, lon, map]);
        return null;
    }

    // Map & Geolocation States
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
    const [userLat, setUserLat] = useState(null);
    const [userLon, setUserLon] = useState(null);
    const [locationError, setLocationError] = useState("");

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
            fetchInitial(searchTerm, userLat, userLon);
        }, 500);
        return () => clearTimeout(delay);
    }, [searchTerm, userLat, userLon]);


    const fetchInitial = async (query, lat, lon) => {
        setLoading(true);
        try {
            let url = `/ngos?keyword=${query}&lastid=0&size=10`;
            if (lat !== null && lon !== null) {
                // If using nearest NGO sort, passing latitude and longitude
                url += `&userLat=${lat}&userLon=${lon}`;
            }
            const res = await api.get(url);
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
            let url = `/ngos?keyword=${searchTerm}&lastid=${cursor}&size=10`;
            if (userLat !== null && userLon !== null) {
                url += `&userLat=${userLat}&userLon=${userLon}`;
            }
            const res = await api.get(url);
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

    useEffect(() => {
        const initMapLocation = async () => {
            if (viewMode === 'map' && userLat === null && userLon === null) {
                const userid = localStorage.getItem('userid');
                let foundSavedLocation = false;

                if (userid) {
                    try {
                        const res = await api.get(`/users/${userid}`);
                        if (res.data && res.data.latitude !== null && res.data.longitude !== null) {
                            setUserLat(res.data.latitude);
                            setUserLon(res.data.longitude);
                            foundSavedLocation = true;
                        }
                    } catch (error) {
                        console.error("Failed to fetch user profile for map center:", error);
                    }
                }

                if (!foundSavedLocation) {
                    handleDetectLocation();
                }
            }
        };

        initMapLocation();
    }, [viewMode]);

    const handleDetectLocation = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLat(position.coords.latitude);
                    setUserLon(position.coords.longitude);
                    setLocationError("");
                },
                (error) => {
                    console.log("Silent location failure: User denied or unavailable.");
                }
            );
        }
    };

    return (
        <div className="min-h-screen bg-[#FFF8F0] p-6 md:p-12">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <h1 className="text-3xl font-bold text-gray-800">NGOs</h1>

                    {/* View Controls */}
                    <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${viewMode === 'list' ? 'bg-[#2E7D32] text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <List size={18} />
                            List
                        </button>
                        <button
                            onClick={() => setViewMode('map')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${viewMode === 'map' ? 'bg-[#2E7D32] text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <MapIcon size={18} />
                            Map
                        </button>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search NGOs by name or location..."
                            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-green-600 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>



                {/* Map View */}
                {viewMode === 'map' && (
                    <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 mb-8 h-[600px] overflow-hidden relative z-0">
                        <MapContainer
                            key={`map-${viewMode}`}
                            center={userLat && userLon ? [userLat, userLon] : [20.5937, 78.9629]} // Default to India center if no location
                            zoom={userLat && userLon ? 12 : 5}
                            scrollWheelZoom={true}
                            style={{ height: '100%', width: '100%', borderRadius: '1.5rem', zIndex: 0 }}
                        >
                            <MapController lat={userLat} lon={userLon} />
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />

                            {/* Donor Location Marker */}
                            {userLat && userLon && (
                                <Marker position={[userLat, userLon]} icon={donorIcon}>
                                    <Popup>
                                        <div className="font-bold text-[#2E7D32]">You are here</div>
                                    </Popup>
                                </Marker>
                            )}

                            {/* NGO Markers */}
                            {ngos.map(u => {
                                // Assume backend returned lat and lon, either mapping it back out or keeping location string if geometry query returns them
                                // For now, if geometry point is properly exposed to frontend DTO as u.latitude and u.longitude
                                if (u.latitude && u.longitude) {
                                    return (
                                        <Marker key={u.userid} position={[u.latitude, u.longitude]}>
                                            <Popup className="ngo-map-popup">
                                                <div className="flex flex-col min-w-[240px]">
                                                    <div className="flex items-center gap-3 border-b border-gray-100 pb-3 mb-3">
                                                        <ProfileImage
                                                            userid={u.userid}
                                                            username={u.username}
                                                            className="w-12 h-12 rounded-full border border-gray-200 shadow-sm object-cover shrink-0"
                                                        />
                                                        <div className="flex flex-col">
                                                            <h3 className="font-bold text-gray-900 text-base leading-tight capitalize line-clamp-2">{u.username}</h3>
                                                            {u.distance !== undefined && (
                                                                <span className="text-xs font-semibold text-[#2E7D32] bg-green-50 px-2 py-0.5 rounded-full mt-1 w-fit border border-[#2E7D32]/20 shadow-sm">
                                                                    {u.distance.toFixed(1)} km away
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-start gap-2 text-gray-600 mb-4">
                                                        <MapPin size={14} className="shrink-0 mt-0.5 text-[#2E7D32]/70" />
                                                        <p className="text-xs leading-relaxed line-clamp-2">{u.location || 'Location missing'}</p>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-2 mt-auto">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleViewDetails(u); }}
                                                            className="text-xs font-bold text-[#2E7D32] py-2 px-2 border border-[#2E7D32]/30 rounded-lg hover:bg-green-50 transition-colors shadow-sm"
                                                        >
                                                            Details
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleDonateClick(u.userid); }}
                                                            className="text-xs font-bold bg-[#2E7D32] text-white py-2 px-2 rounded-lg hover:bg-[#1B5E20] shadow-md transition-all active:scale-95"
                                                        >
                                                            Donate
                                                        </button>
                                                    </div>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    );
                                }
                                return null;
                            })}
                        </MapContainer>
                    </div>
                )}

                {/* List View */}
                {viewMode === 'list' && (
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
                )}

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