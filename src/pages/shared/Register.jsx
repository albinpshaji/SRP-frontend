import { useState, useEffect, useRef } from "react";
import api from "../../services/api";
import { Link, useNavigate } from "react-router-dom";
import { Heart, Camera, Upload, Maximize2, Minimize2, Search, MapPin, Loader2 } from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { GoogleLogin } from "@react-oauth/google";
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

function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('DONOR');
    const [phone, setPhone] = useState('');
    const [location, setLocation] = useState('');
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [isMapExpanded, setIsMapExpanded] = useState(false);

    // Map Search States
    const [mapSearchQuery, setMapSearchQuery] = useState('');
    const [mapSearchResults, setMapSearchResults] = useState([]);
    const [isSearchingMap, setIsSearchingMap] = useState(false);


    const [licenceno, setLicenceno] = useState('');
    const [website, setWebsite] = useState('');
    const [imagefile, setImagefile] = useState(null);


    const [profilePic, setProfilePic] = useState(null);

    const navigate = useNavigate();
    const { showToast } = useToast();

    useEffect(() => {
        if (latitude === null && longitude === null) {
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const lat = position.coords.latitude;
                        const lon = position.coords.longitude;
                        setLatitude(lat);
                        setLongitude(lon);
                        showToast("Location detected automatically!", "success");
                        // Auto-resolve address from coordinates
                        api.get(`/api/locations/search?q=${lat},${lon}`).catch(() => { });
                        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
                            .then(res => res.json())
                            .then(data => { if (data.display_name) setLocation(data.display_name); })
                            .catch(() => { });
                    },
                    (error) => {
                        console.log("GPS auto-detect failed", error);
                        // Default to India center if they block it so they can at least pan
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

    const handleregister = async (e) => {
        e.preventDefault();

        // --- Validation ---
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(phone.trim())) {
            showToast("Phone number must be exactly 10 digits", "error");
            return;
        }
        if (username.trim().length < 3) {
            showToast("Username must be at least 3 characters", "error");
            return;
        }
        if (password.trim().length < 6) {
            showToast("Password must be at least 6 characters", "error");
            return;
        }
        if (latitude === null || longitude === null) {
            showToast("Please pick your location on the map", "error");
            return;
        }
        if (role === 'NGO' && (!imagefile)) {
            showToast("NGO proof document is required", "error");
            return;
        }

        const formData = new FormData();
        const userDto = {
            username: username.trim(),
            password: password.trim(),
            role,
            phone: phone.trim(),
            location: location.trim(),
            licenceno: role === 'NGO' && licenceno ? licenceno.trim() : null,
            website: role === 'NGO' && website ? website.trim() : null,
            latitude,
            longitude
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
            await api.post('/register', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            showToast("Registered successfully!", "success");
            navigate('/login');
        } catch (error) {
            console.error("Registration failed", error);
            const msg = error.response?.data || "Unknown error";
            showToast("Registration failed: " + msg, "error");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FFF8F0] p-4">

            <div className="flex flex-col md:flex-row w-full max-w-5xl bg-white rounded-[2rem] shadow-xl overflow-hidden min-h-[600px]">

                {/* LEFT SIDE: FORM */}
                <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col justify-center">

                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h2>
                    <p className="text-gray-500 mb-6">Join us in making a difference.</p>

                    {/* Role Toggle */}
                    <div className="bg-gray-100 p-1.5 rounded-full flex mb-6 relative">
                        <button
                            type="button"
                            onClick={() => setRole('DONOR')}
                            className={`flex-1 py-3 rounded-full text-sm font-bold transition-all duration-300 ${role === 'DONOR' ? 'bg-white text-gray-800 shadow-md' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            I am a Donor
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole('NGO')}
                            className={`flex-1 py-3 rounded-full text-sm font-bold transition-all duration-300 ${role === 'NGO' ? 'bg-[#2E7D32] text-white shadow-md' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            I am an NGO
                        </button>
                    </div>

                    <form onSubmit={handleregister} className="space-y-4">

                        {/* Location Configurator */}
                        <div className="bg-[#FFF8F0] p-4 rounded-xl flex flex-col gap-3 shadow-sm border border-[#2E7D32]/20">
                            <div className="flex items-center justify-between">
                                <span className="text-[#2E7D32] font-semibold text-sm">
                                    {role === 'NGO' ? 'Pin your NGO on the Donor Map' : 'Pin your Location on the Map'}
                                </span>
                                <span className="text-xs text-[#2E7D32]/80 bg-green-50 px-2 py-1 rounded">
                                    Drag / Click to adjust
                                </span>
                            </div>

                            <div className="mt-2 h-[300px] w-full rounded-xl overflow-hidden border-2 border-[#2E7D32]/20 relative z-0 group">
                                {(latitude !== null && longitude !== null) ? (
                                    <MapContainer
                                        center={[latitude, longitude]}
                                        zoom={13}
                                        scrollWheelZoom={true}
                                        style={{ height: '100%', width: '100%', zIndex: 0 }}
                                    >
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

                                <button
                                    type="button"
                                    onClick={() => setIsMapExpanded(true)}
                                    className="absolute top-2 right-2 p-2 bg-white/90 hover:bg-white text-gray-800 rounded-lg shadow-md z-[1000] transition-transform hover:scale-105"
                                    title="Expand Map"
                                >
                                    <Maximize2 size={18} />
                                </button>
                            </div>

                            {/* Full Screen Map Modal */}
                            {isMapExpanded && (
                                <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 transition-all duration-300">
                                    <div className="bg-white w-full max-w-5xl h-[90vh] rounded-[2rem] overflow-hidden shadow-2xl flex flex-col relative animate-in zoom-in-95 duration-200 border border-[#2E7D32]/20">
                                        <div className="p-5 bg-[#FFF8F0] border-b border-[#2E7D32]/20 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center shadow-sm relative z-[10001]">
                                            <div>
                                                <h3 className="font-bold text-[#2E7D32] text-lg">Pin your NGO Location</h3>
                                                <p className="text-sm text-[#2E7D32]/80 font-medium">Click anywhere on the map to set your address. It will auto-fill the form.</p>
                                            </div>

                                            {/* Map Autocomplete Search */}
                                            <div className="relative w-full md:w-96">
                                                <div className="relative flex items-center">
                                                    <Search className="absolute left-3 text-[#2E7D32]/50" size={18} />
                                                    <input
                                                        type="text"
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
                                                            <button
                                                                key={idx}
                                                                type="button"
                                                                onClick={() => selectMapSearchResult(result)}
                                                                className="w-full text-left px-4 py-3 hover:bg-green-50 border-b border-gray-100 last:border-0 flex items-start gap-3 transition-colors"
                                                            >
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

                                            <button
                                                type="button"
                                                onClick={() => setIsMapExpanded(false)}
                                                className="px-4 py-2 bg-white hover:bg-gray-50 text-[#2E7D32] rounded-xl shadow-sm border border-[#2E7D32]/20 transition-all flex items-center gap-2 font-bold whitespace-nowrap"
                                            >
                                                <Minimize2 size={18} />
                                                Done
                                            </button>
                                        </div>
                                        <div className="flex-1 relative z-[10000]">
                                            {(latitude !== null && longitude !== null) && (
                                                <MapContainer
                                                    center={[latitude, longitude]}
                                                    zoom={15}
                                                    scrollWheelZoom={true}
                                                    style={{ height: '100%', width: '100%' }}
                                                >
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

                        {/* --- NEW: PROFILE PICTURE UPLOAD --- */}
                        <div className="flex items-center space-x-4 mb-2">
                            <div className="relative group">
                                <label className="cursor-pointer">
                                    <div className="w-16 h-16 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-[#2E7D32] hover:bg-green-50 transition-all overflow-hidden">
                                        {profilePic ? (
                                            <img
                                                src={URL.createObjectURL(profilePic)}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <Camera className="text-gray-400 group-hover:text-[#2E7D32]" size={24} />
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        className="hidden"
                                        onChange={(e) => setProfilePic(e.target.files[0])}
                                    />
                                </label>
                            </div>
                            <div className="text-sm text-gray-500">
                                <p className="font-semibold text-gray-700">Profile Photo</p>
                                <p className="text-xs">Optional. Max 5MB.</p>
                            </div>
                        </div>

                        {/* Basic Inputs */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">Username</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-600 outline-none transition-all bg-gray-50 focus:bg-white"
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">Password</label>
                            <input
                                type="password"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-600 outline-none transition-all bg-gray-50 focus:bg-white"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1">Phone</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-600 outline-none bg-gray-50 focus:bg-white"
                                    placeholder="Phone"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1">Location</label>
                                <input
                                    type="text"
                                    readOnly
                                    title={location}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 cursor-not-allowed outline-none"
                                    placeholder="Pick location on map or search"
                                    value={location}
                                    required
                                />
                                {location && (
                                    <p className="text-xs text-gray-500 leading-relaxed mt-1">📍 {location}</p>
                                )}
                            </div>
                        </div>

                        {/* NGO SPECIFIC FIELDS */}
                        <div className={`transition-all duration-500 overflow-hidden ${role === 'NGO' ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                            <div className="space-y-4 pt-2 border-t border-dashed border-gray-300 mt-2">
                                <p className="text-xs font-bold text-[#2E7D32] uppercase tracking-wider">NGO Verification Details</p>

                                <input
                                    type="text"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-600 outline-none bg-gray-50 focus:bg-white"
                                    placeholder="License Number"
                                    value={licenceno}
                                    onChange={(e) => setLicenceno(e.target.value)}
                                    required={role === 'NGO'}
                                />

                                <input
                                    type="text"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-600 outline-none bg-gray-50 focus:bg-white"
                                    placeholder="Website (Optional)"
                                    value={website}
                                    onChange={(e) => setWebsite(e.target.value)}
                                />

                                <div className="relative">
                                    <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#2E7D32] hover:bg-green-50 transition-colors">
                                        <div className="flex items-center space-x-2">
                                            <Upload className="text-gray-400" size={20} />
                                            <span className="text-sm text-gray-500 font-medium">
                                                {imagefile ? imagefile.name : "Upload NGO Proof Document"}
                                            </span>
                                        </div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            onChange={(e) => setImagefile(e.target.files[0])}
                                            required={role === 'NGO'}
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-[#2E7D32] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#1B5E20] transition-all shadow-lg active:scale-95 mt-6"
                        >
                            {role === 'NGO' ? 'Register as NGO' : 'Register as Donor'}
                        </button>

                        {/* Divider */}
                        <div className="flex items-center gap-3 my-4">
                            <div className="flex-1 h-px bg-gray-200"></div>
                            <span className="text-xs text-gray-400 font-medium">OR</span>
                            <div className="flex-1 h-px bg-gray-200"></div>
                        </div>

                        {/* Google Sign-In */}
                        <div className="flex justify-center">
                            <GoogleLogin
                                onSuccess={async (credentialResponse) => {
                                    try {
                                        const response = await api.post('/auth/google', { idToken: credentialResponse.credential });
                                        localStorage.setItem('jwt_token', response.data.token);
                                        localStorage.setItem('role', response.data.role);
                                        localStorage.setItem('userid', response.data.userid);
                                        showToast("Google sign-in successful!", "success");
                                        const r = response.data.role;
                                        if (r === "DONOR") navigate('/mydonations');
                                        else if (r === "NGO") navigate('/incomingdonations');
                                        else if (r === "ADMIN") navigate('/allngos');
                                        else if (r === "NV_NGO") navigate('/verification-pending');
                                        else if (r === "INCOMPLETE") navigate('/complete-profile');
                                        else navigate('/');
                                    } catch (error) {
                                        showToast("Google sign-in failed: " + (error.response?.data || "Unknown error"), "error");
                                    }
                                }}
                                onError={() => showToast("Google sign-in failed", "error")}
                                theme="outline"
                                size="large"
                                text="signup_with"
                            />
                        </div>

                        <p className="text-center text-gray-500 text-sm mt-4">
                            Already have an account? <Link to="/login" className="text-[#2E7D32] font-bold hover:underline">Login</Link>
                        </p>

                    </form>
                </div>

                {/* RIGHT SIDE: VISUAL SECTION */}
                <div className="hidden md:flex w-1/2 bg-[#E8F5E9] items-center justify-center relative p-12">
                    <div className="absolute top-10 right-10 w-20 h-20 bg-[#C8E6C9] rounded-full opacity-50 blur-xl"></div>
                    <div className="absolute bottom-10 left-10 w-32 h-32 bg-[#A5D6A7] rounded-full opacity-50 blur-xl"></div>

                    <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="w-40 h-40 bg-[#2E7D32] rounded-full flex items-center justify-center shadow-2xl mb-6">
                            <Heart size={80} color="white" fill="white" />
                        </div>
                        <h3 className="text-2xl font-bold text-[#1B5E20] mb-2">
                            {role === 'NGO' ? 'Partner with Us' : 'Make a Difference'}
                        </h3>
                        <p className="text-[#2E7D32] max-w-xs">
                            {role === 'NGO'
                                ? 'Join our network to reach more people and amplify your impact.'
                                : 'Join our community to help those in need and track your contributions.'}
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default Register;