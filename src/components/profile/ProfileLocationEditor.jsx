import { useEffect, useRef, useState } from "react";
import api from "../../services/api";
import { Crosshair, Loader2, MapPin, Maximize2, Minimize2, Search } from "lucide-react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

const DEFAULT_LATITUDE = 10.8505;
const DEFAULT_LONGITUDE = 76.2711;

const toCoordinateString = (value) => {
    if (value === null || value === undefined || value === "") {
        return "";
    }

    const parsed = typeof value === "number" ? value : parseFloat(value);
    return Number.isFinite(parsed) ? parsed.toFixed(6) : "";
};

function MapViewport({ latitude, longitude }) {
    const map = useMap();
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    useEffect(() => {
        if (Number.isFinite(lat) && Number.isFinite(lon)) {
            map.setView([lat, lon], map.getZoom(), { animate: true });
        }
    }, [lat, lon, map]);

    return null;
}

function ClickableMarker({ latitude, longitude, onCoordinatePick, onResolveAddress, disabled }) {
    useMapEvents({
        click(event) {
            if (disabled) {
                return;
            }
            const { lat, lng } = event.latlng;
            onCoordinatePick(toCoordinateString(lat), toCoordinateString(lng));
            onResolveAddress(lat, lng);
        },
    });

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
        return null;
    }

    return <Marker position={[lat, lon]} />;
}

function ProfileLocationEditor({
    roleLabel,
    location,
    latitude,
    longitude,
    setLocation,
    setLatitude,
    setLongitude,
    disabled = false,
}) {
    const [isMapExpanded, setIsMapExpanded] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isResolving, setIsResolving] = useState(false);
    const searchTimerRef = useRef(null);

    const currentLat = parseFloat(latitude);
    const currentLon = parseFloat(longitude);
    const hasCoordinates = Number.isFinite(currentLat) && Number.isFinite(currentLon);
    const mapCenter = hasCoordinates ? [currentLat, currentLon] : [DEFAULT_LATITUDE, DEFAULT_LONGITUDE];

    const resolveAddress = async (lat, lon) => {
        setIsResolving(true);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
            const data = await response.json();
            if (data?.display_name) {
                setLocation(data.display_name);
            }
        } catch (error) {
            console.error("Address resolution failed", error);
        } finally {
            setIsResolving(false);
        }
    };

    const handleCoordinatePick = (latValue, lonValue) => {
        setLatitude(latValue);
        setLongitude(lonValue);
    };

    const handleSearch = (value) => {
        setSearchQuery(value);

        if (searchTimerRef.current) {
            clearTimeout(searchTimerRef.current);
        }

        if (!value || value.trim().length < 3) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        searchTimerRef.current = setTimeout(async () => {
            setIsSearching(true);
            try {
                const response = await api.get(`/api/locations/search?q=${encodeURIComponent(value)}`);
                setSearchResults(response.data || []);
            } catch (error) {
                console.error("Location search failed", error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 450);
    };

    const selectSearchResult = (result) => {
        const lat = toCoordinateString(result.lat);
        const lon = toCoordinateString(result.lon);
        setLatitude(lat);
        setLongitude(lon);
        setLocation(result.display_name || "");
        setSearchQuery("");
        setSearchResults([]);
    };

    const detectCurrentLocation = () => {
        if (!("geolocation" in navigator) || disabled) {
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = toCoordinateString(position.coords.latitude);
                const lon = toCoordinateString(position.coords.longitude);
                setLatitude(lat);
                setLongitude(lon);
                await resolveAddress(position.coords.latitude, position.coords.longitude);
            },
            (error) => {
                console.error("Current location lookup failed", error);
            }
        );
    };

    const renderSearchField = (resultsClassName = "z-[1100]") => (
        <div className="relative">
            <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Search className="h-4 w-4" />
            </div>
            <input
                type="text"
                value={searchQuery}
                disabled={disabled}
                onChange={(event) => handleSearch(event.target.value)}
                placeholder="Search for a place or address"
                className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-10 text-sm text-slate-900 outline-none transition focus:border-green-400 focus:ring-4 focus:ring-green-100 disabled:bg-slate-50"
            />
            {isSearching && <Loader2 className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-[#2E7D32]" />}
            {searchResults.length > 0 && !disabled && (
                <div className={`absolute mt-2 max-h-64 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl ${resultsClassName}`}>
                    {searchResults.map((result, index) => (
                        <button
                            key={`${result.place_id || result.lat}-${index}`}
                            type="button"
                            onClick={() => selectSearchResult(result)}
                            className="flex w-full items-start gap-3 border-b border-slate-100 px-4 py-3 text-left transition hover:bg-slate-50 last:border-b-0"
                        >
                            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#2E7D32]" />
                            <div>
                                <p className="text-sm font-semibold text-slate-900">{result.name || result.display_name?.split(",")[0]}</p>
                                <p className="text-xs text-slate-500">{result.display_name}</p>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );

    const renderMap = (expanded = false) => (
        <div className={`relative overflow-hidden rounded-[24px] border border-green-100 ${expanded ? "h-full min-h-[420px]" : "h-[280px]"}`}>
            <MapContainer center={mapCenter} zoom={13} scrollWheelZoom={!disabled} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapViewport latitude={latitude} longitude={longitude} />
                <ClickableMarker
                    latitude={latitude}
                    longitude={longitude}
                    onCoordinatePick={handleCoordinatePick}
                    onResolveAddress={resolveAddress}
                    disabled={disabled}
                />
            </MapContainer>

            <div className="pointer-events-none absolute left-3 top-3 z-[600] rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
                {disabled ? "Map preview" : "Click map to update coordinates"}
            </div>

            {!expanded && (
                <button
                    type="button"
                    onClick={() => setIsMapExpanded(true)}
                    className="absolute right-3 top-3 z-[600] rounded-full bg-white/95 p-2 text-slate-700 shadow-sm transition hover:scale-105"
                    title="Expand map"
                >
                    <Maximize2 className="h-4 w-4" />
                </button>
            )}
        </div>
    );

    return (
        <div className="space-y-5 rounded-[28px] border border-green-100 bg-[#F9FFF7] p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#2E7D32]">Location settings</p>
                    <h3 className="mt-2 text-xl font-semibold text-slate-900">Keep your {roleLabel} location accurate.</h3>
                    <p className="mt-1 text-sm text-slate-500">Edit the display name, coordinates, or use map search to reposition your pin.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={() => setIsMapExpanded(true)}
                        className="inline-flex items-center gap-2 rounded-full border border-green-100 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-green-300 hover:text-[#2E7D32]"
                    >
                        <Maximize2 className="h-4 w-4" />
                        Expand map
                    </button>
                    <button
                        type="button"
                        disabled={disabled}
                        onClick={detectCurrentLocation}
                        className="inline-flex items-center gap-2 rounded-full border border-green-100 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-green-300 hover:text-[#2E7D32] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <Crosshair className="h-4 w-4" />
                        Use current location
                    </button>
                </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="space-y-4">
                    <label className="block">
                        <span className="mb-2 block text-sm font-semibold text-slate-700">Location name</span>
                        <input
                            type="text"
                            value={location}
                            disabled={disabled}
                            onChange={(event) => setLocation(event.target.value)}
                            placeholder="Ward, town, landmark or full address"
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-green-400 focus:ring-4 focus:ring-green-100 disabled:bg-slate-50"
                        />
                    </label>

                    <div className="grid gap-4 md:grid-cols-2">
                        <label className="block">
                            <span className="mb-2 block text-sm font-semibold text-slate-700">Latitude</span>
                            <input
                                type="number"
                                step="any"
                                value={latitude}
                                disabled={disabled}
                                onChange={(event) => setLatitude(event.target.value)}
                                placeholder="10.850500"
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-green-400 focus:ring-4 focus:ring-green-100 disabled:bg-slate-50"
                            />
                        </label>
                        <label className="block">
                            <span className="mb-2 block text-sm font-semibold text-slate-700">Longitude</span>
                            <input
                                type="number"
                                step="any"
                                value={longitude}
                                disabled={disabled}
                                onChange={(event) => setLongitude(event.target.value)}
                                placeholder="76.271100"
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-green-400 focus:ring-4 focus:ring-green-100 disabled:bg-slate-50"
                            />
                        </label>
                    </div>

                    {renderSearchField()}

                    <div className="rounded-2xl border border-dashed border-green-100 bg-white px-4 py-3 text-sm text-slate-600">
                        {isResolving ? "Resolving address from coordinates..." : "Tip: type coordinates directly or click on the map to update the pin."}
                    </div>
                </div>

                {renderMap(false)}
            </div>

            {isMapExpanded && (
                <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
                    <div className="relative flex h-[88vh] w-full max-w-6xl flex-col overflow-hidden rounded-[32px] border border-green-100 bg-white shadow-2xl">
                        <div className="border-b border-green-100 bg-[#FFF8F0] px-6 py-5">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#2E7D32]">Expanded map</p>
                                    <h4 className="mt-1 text-lg font-semibold text-slate-900">Adjust your location precisely.</h4>
                                    <p className="mt-1 text-sm text-slate-500">Search for a place or click directly on the map to move your pin.</p>
                                </div>
                                <div className="w-full max-w-xl">
                                    {renderSearchField("z-[1300]")}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsMapExpanded(false)}
                                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
                                >
                                    <Minimize2 className="h-4 w-4" />
                                    Close map
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 p-5">
                            {renderMap(true)}
                        </div>
                        {hasCoordinates && (
                            <div className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 rounded-2xl border border-green-200 bg-white px-6 py-3 text-center shadow-xl">
                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#2E7D32]">Selected coordinates</p>
                                <p className="mt-1 text-sm font-semibold text-slate-900">
                                    {parseFloat(latitude).toFixed(6)}, {parseFloat(longitude).toFixed(6)}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProfileLocationEditor;
