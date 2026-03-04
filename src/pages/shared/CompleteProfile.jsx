import { useState, useEffect, useRef } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import { Camera, Upload, Maximize2, Minimize2, Search, MapPin, Loader2 } from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

function CompleteProfile() {
    const [role, setRole] = useState('DONOR');
    const [username, setUsername] = useState('');
    const [phone, setPhone] = useState('');
    const [location, setLocation] = useState('');
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [isMapExpanded, setIsMapExpanded] = useState(false);

    // Map Search States
    const [mapSearchQuery, setMapSearchQuery] = useState('');
    const [mapSearchResults, setMapSearchResults] = useState([]);
    const [isSearchingMap, setIsSearchingMap] = useState(false);

    // NGO-specific fields
    const [licenceno, setLicenceno] = useState('');
    const [website, setWebsite] = useState('');
    const [imagefile, setImagefile] = useState(null);

    const [profilePic, setProfilePic] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigate = useNavigate();
    const { showToast } = useToast();

    useEffect(() => {
        if (latitude === null && longitude === null) {
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        setLatitude(position.coords.latitude);
                        setLongitude(position.coords.longitude);
                        showToast("Location detected automatically!", "success");
                        // Auto-resolve address from coordinates
                        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`)
                            .then(res => res.json())
                            .then(data => { if (data.display_name) setLocation(data.display_name); })
                            .catch(() => { });
                    },
                    () => {
                        setLatitude(20.5937);
                        setLongitude(78.9629);
                        showToast("Please pick your location on the map", "info");
                    }
                );
            } else {
                setLatitude(20.5937);
                setLongitude(78.9629);
            }
        }
    }, [latitude, longitude, showToast]);

    const searchTimerRef = useRef(null);

    const handleMapSearch = (query) => {
        setMapSearchQuery(query);
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        if (!query || query.trim().length < 3) {
            setMapSearchResults([]);
            setIsSearchingMap(false);
            return;
        }
        searchTimerRef.current = setTimeout(async () => {
            setIsSearchingMap(true);
            try {
                const response = await api.get(`/api/locations/search?q=${encodeURIComponent(query)}`);
                setMapSearchResults(response.data || []);
            } catch (error) {
                console.error("Map search failed", error);
            } finally {
                setIsSearchingMap(false);
            }
        }, 600);
    };

    const selectMapSearchResult = (result) => {
        const lat = parseFloat(result.lat);
        const lon = parseFloat(result.lon);
        setLatitude(lat);
        setLongitude(lon);
        setLocation(result.display_name);
        setMapSearchQuery('');
        setMapSearchResults([]);
        showToast("Location updated from search", "success");
    };

    function LocationMarker() {
        useMapEvents({
            click(e) {
                const { lat, lng } = e.latlng;
                setLatitude(lat);
                setLongitude(lng);
                setLocation('Resolving address...');
                showToast("Pin dropped! Resolving address...", "info");
                fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
                    .then(res => res.json())
                    .then(data => { if (data.display_name) setLocation(data.display_name); else setLocation(''); })
                    .catch(() => setLocation(''));
            },
        });
        return latitude === null ? null : (
            <Marker position={[latitude, longitude]}></Marker>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // --- Validation ---
        if (username.trim().length < 3) {
            showToast("Username must be at least 3 characters", "error");
            setIsSubmitting(false);
            return;
        }
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(phone.trim())) {
            showToast("Phone number must be exactly 10 digits", "error");
            setIsSubmitting(false);
            return;
        }
        if (latitude === null || longitude === null) {
            showToast("Please pick your location on the map", "error");
            setIsSubmitting(false);
            return;
        }
        if (role === 'NGO' && !imagefile) {
            showToast("NGO proof document is required", "error");
            setIsSubmitting(false);
            return;
        }
        if (role === 'NGO' && !licenceno.trim()) {
            showToast("NGO licence number is required", "error");
            setIsSubmitting(false);
            return;
        }

        const formData = new FormData();
        const userDto = {
            username: username.trim(),
            role,
            phone: phone.trim(),
            location: location.trim(),
            latitude,
            longitude,
            licenceno: role === 'NGO' && licenceno ? licenceno.trim() : null,
            website: role === 'NGO' && website ? website.trim() : null,
        };

        formData.append('user', new Blob([JSON.stringify(userDto)], {
            type: 'application/json'
        }));

        if (role === 'NGO' && imagefile) {
            formData.append('proof', imagefile);
        }

        if (profilePic) {
            formData.append('profilepic', profilePic);
        }

        try {
            const response = await api.put('/complete-profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            localStorage.setItem('jwt_token', response.data.token);
            localStorage.setItem('role', response.data.role);
            localStorage.setItem('userid', response.data.userid);

            showToast("Profile completed successfully!", "success");

            if (response.data.role === "DONOR") {
                navigate('/mydonations');
            } else if (response.data.role === "NV_NGO") {
                navigate('/verification-pending');
            } else {
                navigate('/');
            }
        } catch (error) {
            console.error("Profile completion failed", error);
            showToast("Failed: " + (error.response?.data || "Unknown error"), "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FFF8F0] p-4">
            <div className="w-full max-w-2xl bg-white rounded-[2rem] shadow-xl p-6 md:p-12">

                <h2 className="text-3xl font-bold text-gray-800 mb-2">Complete Your Profile</h2>
                <p className="text-gray-500 mb-6">Just a few more details to get started.</p>

                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Role Toggle */}
                    <div>
                        <label className="text-sm font-semibold text-gray-600 block mb-2">I am a</label>
                        <div className="flex gap-3">
                            <button type="button"
                                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all border-2 ${role === 'DONOR'
                                    ? 'bg-[#2E7D32] text-white border-[#2E7D32] shadow-md'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-[#2E7D32]/30'}`}
                                onClick={() => setRole('DONOR')}>
                                Donor
                            </button>
                            <button type="button"
                                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all border-2 ${role === 'NGO'
                                    ? 'bg-[#2E7D32] text-white border-[#2E7D32] shadow-md'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-[#2E7D32]/30'}`}
                                onClick={() => setRole('NGO')}>
                                NGO
                            </button>
                        </div>
                    </div>

                    {/* Username */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-600">Username *</label>
                        <input type="text" required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-600 outline-none transition-all"
                            placeholder="Choose a unique username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>

                    {/* Phone */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-600">Phone Number *</label>
                        <input type="text" required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-600 outline-none transition-all"
                            placeholder="Enter your phone number"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>

                    {/* Profile Picture */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-600">Profile Picture</label>
                        <label className="flex items-center gap-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                            <Camera size={18} className="text-gray-400" />
                            <span className="text-sm text-gray-500">{profilePic ? profilePic.name : 'Choose a photo'}</span>
                            <input type="file" accept="image/*" className="hidden"
                                onChange={(e) => setProfilePic(e.target.files[0])} />
                        </label>
                    </div>

                    {/* NGO-specific fields */}
                    {role === 'NGO' && (
                        <div className="space-y-4 p-4 bg-green-50 rounded-xl border border-green-100">
                            <h3 className="text-sm font-bold text-[#2E7D32]">NGO Details</h3>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-gray-600">Licence Number *</label>
                                <input type="text" required
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-600 outline-none transition-all"
                                    placeholder="Your NGO licence number"
                                    value={licenceno}
                                    onChange={(e) => setLicenceno(e.target.value)}
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-gray-600">Website</label>
                                <input type="text"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-600 outline-none transition-all"
                                    placeholder="https://your-ngo.org"
                                    value={website}
                                    onChange={(e) => setWebsite(e.target.value)}
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-gray-600">Proof Certificate *</label>
                                <label className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                                    <Upload size={18} className="text-gray-400" />
                                    <span className="text-sm text-gray-500">{imagefile ? imagefile.name : 'Upload proof document'}</span>
                                    <input type="file" accept="image/*,.pdf" className="hidden" required
                                        onChange={(e) => setImagefile(e.target.files[0])} />
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Location */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-600">Location</label>
                        <input type="text"
                            readOnly
                            title={location}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 cursor-not-allowed outline-none"
                            placeholder="Pick location on map or search above"
                            value={location}
                        />
                        {location && (
                            <p className="text-xs text-gray-500 leading-relaxed">📍 {location}</p>
                        )}
                    </div>

                    {/* Map */}
                    <div className="bg-[#FFF8F0] p-4 rounded-xl flex flex-col gap-3 shadow-sm border border-[#2E7D32]/20">
                        <div className="flex items-center justify-between">
                            <span className="text-[#2E7D32] font-semibold text-sm">
                                {role === 'NGO' ? 'Pin your NGO on the Map' : 'Pin your Location on the Map'}
                            </span>
                            <span className="text-xs text-[#2E7D32]/80 bg-green-50 px-2 py-1 rounded">
                                Click to adjust
                            </span>
                        </div>

                        <div className="mt-2 h-[200px] w-full rounded-xl overflow-hidden border-2 border-[#2E7D32]/20 relative z-0">
                            {latitude !== null && longitude !== null ? (
                                <MapContainer center={[latitude, longitude]} zoom={13}
                                    scrollWheelZoom={true}
                                    style={{ height: '100%', width: '100%', zIndex: 0 }}>
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    <LocationMarker />
                                </MapContainer>
                            ) : (
                                <div className="flex items-center justify-center w-full h-full bg-green-50 text-[#2E7D32] font-bold">
                                    Loading Map...
                                </div>
                            )}
                            <div className="absolute top-2 left-2 bg-white/90 px-3 py-1.5 rounded-lg text-xs font-bold text-[#2E7D32] pointer-events-none shadow-sm backdrop-blur-sm z-[1000]">
                                Click anywhere to drop pin
                            </div>
                            <button type="button"
                                onClick={() => setIsMapExpanded(true)}
                                className="absolute top-2 right-2 p-2 bg-white/90 hover:bg-white text-gray-800 rounded-lg shadow-md z-[1000] transition-transform hover:scale-105"
                                title="Expand Map">
                                <Maximize2 size={18} />
                            </button>
                        </div>

                        {/* Full Screen Map Modal */}
                        {isMapExpanded && (
                            <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 transition-all duration-300">
                                <div className="bg-white w-full max-w-5xl h-[90vh] rounded-[2rem] overflow-hidden shadow-2xl flex flex-col relative animate-in zoom-in-95 duration-200 border border-[#2E7D32]/20">
                                    <div className="p-5 bg-[#FFF8F0] border-b border-[#2E7D32]/20 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center shadow-sm relative z-[10001]">
                                        <div>
                                            <h3 className="font-bold text-[#2E7D32] text-lg">Pin your Location</h3>
                                            <p className="text-sm text-[#2E7D32]/80 font-medium">Click anywhere on the map to set your address.</p>
                                        </div>

                                        {/* Map Search */}
                                        <div className="relative w-full md:w-96">
                                            <div className="relative flex items-center">
                                                <Search className="absolute left-3 text-[#2E7D32]/50" size={18} />
                                                <input type="text"
                                                    placeholder="Search for a city or place..."
                                                    value={mapSearchQuery}
                                                    onChange={(e) => handleMapSearch(e.target.value)}
                                                    className="w-full pl-10 pr-10 py-2 border border-[#2E7D32]/30 rounded-xl focus:ring-2 focus:ring-[#2E7D32] outline-none shadow-sm text-sm"
                                                />
                                                {isSearchingMap && (
                                                    <Loader2 className="absolute right-3 text-[#2E7D32] animate-spin" size={18} />
                                                )}
                                            </div>
                                            {mapSearchResults.length > 0 && (
                                                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#2E7D32]/20 rounded-xl shadow-xl overflow-hidden z-[10002] max-h-60 overflow-y-auto">
                                                    {mapSearchResults.map((result, idx) => (
                                                        <button key={idx} type="button"
                                                            onClick={() => selectMapSearchResult(result)}
                                                            className="w-full text-left px-4 py-3 hover:bg-green-50 border-b border-gray-100 last:border-0 flex items-start gap-3 transition-colors">
                                                            <MapPin className="text-[#2E7D32] mt-0.5 shrink-0" size={16} />
                                                            <div>
                                                                <div className="text-sm font-semibold text-gray-800 line-clamp-1">{result.name || result.display_name.split(',')[0]}</div>
                                                                <div className="text-xs text-gray-500 line-clamp-1">{result.display_name}</div>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <button type="button"
                                            onClick={() => setIsMapExpanded(false)}
                                            className="px-4 py-2 bg-white hover:bg-gray-50 text-[#2E7D32] rounded-xl shadow-sm border border-[#2E7D32]/20 transition-all flex items-center gap-2 font-bold whitespace-nowrap">
                                            <Minimize2 size={18} />
                                            Done
                                        </button>
                                    </div>
                                    <div className="flex-1 relative z-[10000]">
                                        {latitude !== null && longitude !== null && (
                                            <MapContainer center={[latitude, longitude]} zoom={15}
                                                scrollWheelZoom={true}
                                                style={{ height: '100%', width: '100%' }}>
                                                <TileLayer
                                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                />
                                                <LocationMarker />
                                            </MapContainer>
                                        )}
                                    </div>
                                    {latitude && longitude && (
                                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white px-8 py-4 rounded-2xl shadow-xl border-2 border-[#2E7D32] text-[#2E7D32] font-bold z-[10001] flex flex-col items-center">
                                            <span className="text-lg">✓ Location Locked</span>
                                            <span className="text-sm text-[#2E7D32]/70 font-medium mt-1">You can close this map now.</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {latitude && longitude && (
                            <div className="text-xs text-green-700 font-bold bg-green-100 p-2 rounded mt-2 text-center">
                                ✓ Location Locked ({latitude.toFixed(4)}, {longitude.toFixed(4)})
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button type="submit" disabled={isSubmitting}
                        className="w-full bg-[#2E7D32] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#1B5E20] transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                        {isSubmitting ? (
                            <span className="flex items-center justify-center gap-2">
                                <Loader2 size={20} className="animate-spin" /> Saving...
                            </span>
                        ) : (
                            role === 'NGO' ? 'Submit for Verification' : 'Complete Profile'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default CompleteProfile;
