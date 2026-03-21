import { Fragment, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { Calendar, Clock3, Filter, MapPin, Package, RefreshCw, Route, Truck, User } from "lucide-react";
import DonationImage from "../../components/common/DonationImage";
import { useToast } from "../../context/ToastContext";
import { MapContainer, Marker, Popup, Polyline, TileLayer } from "react-leaflet";
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

const statusColors = {
    PENDING: "bg-orange-100 text-orange-800",
    ACCEPTED: "bg-purple-100 text-purple-800",
    IN_TRANSIT: "bg-blue-100 text-blue-800",
    DELIVERED: "bg-green-100 text-green-800",
    RECEIVED: "bg-teal-100 text-teal-800",
};

const routeColors = ["#2E7D32", "#0F766E", "#2563EB", "#D97706", "#B91C1C", "#7C3AED"];
const DEFAULT_CENTER = [10.8505, 76.2711];

const formatDateTime = (value) => {
    if (!value) return null;
    return new Date(value).toLocaleString();
};

const formatAvailability = (item) => {
    const from = formatDateTime(item.availabilityStart);
    const to = formatDateTime(item.availabilityEnd);
    if (from && to) return `${from} to ${to}`;
    if (from) return `From ${from}`;
    if (to) return `Until ${to}`;
    return item.pickupdate ? `Exact time: ${formatDateTime(item.pickupdate)}` : "Flexible";
};

const prettyPreference = (value) => {
    if (!value) return "Flexible";
    return value.replaceAll("_", " ").toLowerCase().replace(/^\w/, (character) => character.toUpperCase());
};

const extractApiErrorMessage = (error, fallbackMessage) => {
    const payload = error?.response?.data;
    if (typeof payload === "string" && payload.trim()) {
        return payload;
    }
    if (payload && typeof payload === "object") {
        if (typeof payload.message === "string" && payload.message.trim()) {
            return payload.message;
        }
        if (typeof payload.error === "string" && payload.error.trim()) {
            return payload.error;
        }
    }
    return fallbackMessage;
};

const isRoutablePickup = (item) => item.method?.toLowerCase() === "pickup"
    && item.pickupLatitude !== null
    && item.pickupLongitude !== null
    && item.donationStatus?.toUpperCase() === "ACCEPTED"
    && !["DELIVERED", "RECEIVED"].includes((item.deliverystatus || "").toUpperCase());

function Logistics() {
    const [items, setItems] = useState([]);
    const [routePlan, setRoutePlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [routeLoading, setRouteLoading] = useState(false);
    const [routeError, setRouteError] = useState("");
    const [updatingId, setUpdatingId] = useState(null);
    const [routeMode, setRouteMode] = useState("SINGLE");
    const [selectedLogisticsId, setSelectedLogisticsId] = useState("");
    const [scheduleScope, setScheduleScope] = useState("ALL_DATES");
    const [filterFrom, setFilterFrom] = useState("");
    const [filterTo, setFilterTo] = useState("");
    const [timePreference, setTimePreference] = useState("ANYTIME");
    const [dayPreference, setDayPreference] = useState("ANY_DAY");
    const navigate = useNavigate();
    const { showToast } = useToast();

    const pickupOptions = useMemo(() => items.filter(isRoutablePickup), [items]);

    const fetchLogistics = async () => {
        setLoading(true);
        try {
            const res = await api.get("/logistics");
            const logisticsItems = Array.isArray(res.data) ? res.data : [];
            setItems(logisticsItems);
        } catch (err) {
            console.error("Failed to fetch logistics:", err);
            showToast("Failed to load logistics records.", "error");
        } finally {
            setLoading(false);
        }
    };

    const fetchRoutePlan = async (overrides = {}) => {
        const nextRouteMode = overrides.routeMode ?? routeMode;
        const nextSelectedLogisticsId = overrides.selectedLogisticsId ?? selectedLogisticsId;
        const nextScheduleScope = overrides.scheduleScope ?? scheduleScope;
        const nextFilterFrom = overrides.filterFrom ?? filterFrom;
        const nextFilterTo = overrides.filterTo ?? filterTo;
        const nextTimePreference = overrides.timePreference ?? timePreference;
        const nextDayPreference = overrides.dayPreference ?? dayPreference;
        const effectiveSelectedLogisticsId = nextRouteMode === "SINGLE"
            ? (nextSelectedLogisticsId || (pickupOptions[0] ? String(pickupOptions[0].logisticsid) : ""))
            : nextSelectedLogisticsId;

        if (pickupOptions.length === 0) {
            setRouteError("");
            setRoutePlan(null);
            return;
        }

        if (nextRouteMode === "SINGLE" && !effectiveSelectedLogisticsId) {
            setRoutePlan(null);
            setRouteError("Select a pickup item to see its road route.");
            return;
        }

        setRouteLoading(true);
        setRouteError("");
        try {
            const params = {
                mode: nextRouteMode,
            };

            if (nextRouteMode === "SINGLE" && effectiveSelectedLogisticsId) {
                params.logisticsId = effectiveSelectedLogisticsId;
            }

            if (nextRouteMode !== "SINGLE" && nextScheduleScope === "SCHEDULED_RANGE") {
                if (nextFilterFrom) params.from = nextFilterFrom;
                if (nextFilterTo) params.to = nextFilterTo;
                params.timePreference = nextTimePreference;
                params.dayPreference = nextDayPreference;
            }

            const response = await api.get("/logistics/routes", { params });
            setRoutePlan(response.data || null);
        } catch (error) {
            console.error("Failed to fetch route plan:", error);
            setRoutePlan(null);
            setRouteError(extractApiErrorMessage(error, "Unable to calculate routes right now."));
        } finally {
            setRouteLoading(false);
        }
    };

    useEffect(() => {
        fetchLogistics();
    }, []);

    useEffect(() => {
        if (pickupOptions.length === 0) {
            setSelectedLogisticsId("");
            return;
        }

        const currentSelectionExists = pickupOptions.some(
            (option) => String(option.logisticsid) === String(selectedLogisticsId)
        );

        if (!currentSelectionExists) {
            setSelectedLogisticsId(String(pickupOptions[0].logisticsid));
        }
    }, [pickupOptions, selectedLogisticsId]);

    useEffect(() => {
        if (!loading) {
            fetchRoutePlan();
        }
    }, [loading]);

    const focusRouteOnItem = async (logisticsId) => {
        const nextSelectedLogisticsId = String(logisticsId);
        setRouteMode("SINGLE");
        setScheduleScope("ALL_DATES");
        setFilterFrom("");
        setFilterTo("");
        setTimePreference("ANYTIME");
        setDayPreference("ANY_DAY");
        setSelectedLogisticsId(nextSelectedLogisticsId);
        await fetchRoutePlan({
            routeMode: "SINGLE",
            selectedLogisticsId: nextSelectedLogisticsId,
            scheduleScope: "ALL_DATES",
            filterFrom: "",
            filterTo: "",
            timePreference: "ANYTIME",
            dayPreference: "ANY_DAY",
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleStatusUpdate = async (logisticsid, newStatus) => {
        setUpdatingId(logisticsid);
        try {
            await api.put(`/logistics/${logisticsid}`, { deliverystatus: newStatus });
            showToast(`Status updated to ${newStatus.replace("_", " ")}`, "success");
            await fetchLogistics();
            await fetchRoutePlan();
        } catch (err) {
            showToast("Failed to update status.", "error");
        } finally {
            setUpdatingId(null);
        }
    };

    const handleViewDetails = (donationId) => {
        if (donationId) {
            navigate(`/logistics/${donationId}`);
        }
    };

    const getNextStatus = (current, method) => {
        const isDropoff = method?.toLowerCase().includes("drop");
        const flow = isDropoff
            ? ["PENDING", "ACCEPTED", "RECEIVED"]
            : ["PENDING", "ACCEPTED", "IN_TRANSIT", "DELIVERED"];

        const idx = flow.indexOf(current?.toUpperCase());
        return idx !== -1 && idx < flow.length - 1 ? flow[idx + 1] : null;
    };

    const mapCenter = routePlan?.hubLatitude && routePlan?.hubLongitude
        ? [routePlan.hubLatitude, routePlan.hubLongitude]
        : DEFAULT_CENTER;

    const routeModeDescription = {
        OPTIMIZED: "One combined trip that reorders matched pickup stops to reduce total driving.",
        ALL: "Every matched pickup shown as its own road route from your NGO base.",
        SINGLE: "Route one selected pickup directly from the logistics list or the selector below.",
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center">
                <p className="text-gray-500 text-lg animate-pulse">Loading logistics...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FFF8F0] p-6 md:p-12">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Logistics Management</h1>
                        <p className="text-gray-500 mt-1">Track delivery status and plan pickups around donor availability.</p>
                    </div>
                    <button
                        onClick={async () => {
                            await fetchLogistics();
                            await fetchRoutePlan();
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:text-green-700 hover:border-green-300 transition-all text-sm font-medium shadow-sm"
                    >
                        <RefreshCw className="w-4 h-4" /> Refresh
                    </button>
                </div>

                <section className="mb-8 rounded-[30px] border border-green-100 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#2E7D32]">Route planning</p>
                            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Choose how logistics should be viewed</h2>
                            <p className="mt-2 max-w-3xl text-sm text-slate-600">
                                {routeModeDescription[routeMode]}
                            </p>
                        </div>
                        {routePlan?.routeCount > 0 && (
                            <div className="flex flex-wrap gap-3">
                                <div className="rounded-2xl bg-[#E8F5E9] px-4 py-3 text-sm font-semibold text-[#2E7D32]">
                                    {routePlan.stopCount} stop{routePlan.stopCount === 1 ? "" : "s"}
                                </div>
                                <div className="rounded-2xl bg-[#FFF8F0] px-4 py-3 text-sm font-semibold text-slate-700">
                                    {routePlan.routeCount} route{routePlan.routeCount === 1 ? "" : "s"}
                                </div>
                                <div className="rounded-2xl bg-[#FFF8F0] px-4 py-3 text-sm font-semibold text-slate-700">
                                    {routePlan.totalDistanceKm} km
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 rounded-[24px] border border-green-100 bg-[#F9FFF7] p-5">
                        <div className="grid gap-4 lg:grid-cols-3">
                            <div className="lg:col-span-3 flex flex-wrap gap-3">
                                {["OPTIMIZED", "ALL", "SINGLE"].map((mode) => (
                                    <button
                                        key={mode}
                                        type="button"
                                        onClick={() => setRouteMode(mode)}
                                        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${routeMode === mode
                                            ? "bg-[#2E7D32] text-white"
                                            : "bg-white text-slate-700 border border-green-100 hover:border-green-300 hover:text-[#2E7D32]"
                                            }`}
                                    >
                                        {mode === "OPTIMIZED" ? "Optimized Trip" : mode === "ALL" ? "All Routes" : "Single Route"}
                                    </button>
                                ))}
                            </div>

                            {routeMode === "SINGLE" && (
                                <div className="lg:col-span-3">
                                    <label className="mb-1 block text-sm font-semibold text-slate-700">Pickup Item</label>
                                    <select
                                        value={selectedLogisticsId}
                                        onChange={(event) => setSelectedLogisticsId(event.target.value)}
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
                                        disabled={pickupOptions.length === 0}
                                    >
                                        {pickupOptions.length > 0 ? (
                                            pickupOptions.map((option) => (
                                                <option key={option.logisticsid} value={option.logisticsid}>
                                                    {option.donationTitle}
                                                </option>
                                            ))
                                        ) : (
                                            <option value="">No accepted pickup items are ready for routing</option>
                                        )}
                                    </select>
                                    <p className="mt-2 text-xs text-slate-500">
                                        Single-item routing ignores batch date filters so you can open one pickup route immediately.
                                    </p>
                                </div>
                            )}

                            {routeMode !== "SINGLE" && (
                                <div className="lg:col-span-3">
                                    <p className="mb-2 text-sm font-semibold text-slate-700">Pickup window</p>
                                    <div className="flex flex-wrap gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setScheduleScope("ALL_DATES")}
                                            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${scheduleScope === "ALL_DATES"
                                                ? "bg-[#2E7D32] text-white"
                                                : "bg-white text-slate-700 border border-green-100 hover:border-green-300 hover:text-[#2E7D32]"
                                                }`}
                                        >
                                            All dates
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setScheduleScope("SCHEDULED_RANGE")}
                                            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${scheduleScope === "SCHEDULED_RANGE"
                                                ? "bg-[#2E7D32] text-white"
                                                : "bg-white text-slate-700 border border-green-100 hover:border-green-300 hover:text-[#2E7D32]"
                                                }`}
                                        >
                                            Scheduled range
                                        </button>
                                    </div>
                                </div>
                            )}

                            {routeMode !== "SINGLE" && scheduleScope === "SCHEDULED_RANGE" && (
                                <>
                                    <div>
                                        <label className="mb-1 block text-sm font-semibold text-slate-700">From</label>
                                        <input
                                            type="datetime-local"
                                            value={filterFrom}
                                            onChange={(event) => setFilterFrom(event.target.value)}
                                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-sm font-semibold text-slate-700">To</label>
                                        <input
                                            type="datetime-local"
                                            value={filterTo}
                                            onChange={(event) => setFilterTo(event.target.value)}
                                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-sm font-semibold text-slate-700">Time Preference</label>
                                        <select
                                            value={timePreference}
                                            onChange={(event) => setTimePreference(event.target.value)}
                                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
                                        >
                                            <option value="ANYTIME">Anytime</option>
                                            <option value="MORNING">Morning</option>
                                            <option value="AFTERNOON">Afternoon</option>
                                            <option value="EVENING">Evening</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-sm font-semibold text-slate-700">Day Preference</label>
                                        <select
                                            value={dayPreference}
                                            onChange={(event) => setDayPreference(event.target.value)}
                                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
                                        >
                                            <option value="ANY_DAY">Any day</option>
                                            <option value="WEEKDAYS_ONLY">Weekdays only</option>
                                            <option value="WEEKENDS_ONLY">Weekends only</option>
                                        </select>
                                    </div>
                                </>
                            )}

                            {routeMode !== "SINGLE" && scheduleScope === "ALL_DATES" && (
                                <div className="lg:col-span-3 rounded-2xl border border-green-100 bg-white px-4 py-4 text-sm text-slate-600">
                                    All accepted pickup donations with map locations will be included, regardless of date.
                                </div>
                            )}

                            <div className="lg:col-span-3 flex flex-wrap gap-3">
                                <button
                                    type="button"
                                    onClick={() => fetchRoutePlan()}
                                    disabled={pickupOptions.length === 0}
                                    className="inline-flex items-center gap-2 rounded-full bg-[#2E7D32] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#1B5E20] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <Filter className="h-4 w-4" />
                                    {routeMode === "SINGLE" ? "Show selected route" : "Plan routes"}
                                </button>
                                <button
                                    type="button"
                                    onClick={async () => {
                                        setRouteMode("ALL");
                                        setScheduleScope("ALL_DATES");
                                        setFilterFrom("");
                                        setFilterTo("");
                                        setTimePreference("ANYTIME");
                                        setDayPreference("ANY_DAY");
                                        await fetchRoutePlan({
                                            routeMode: "ALL",
                                            scheduleScope: "ALL_DATES",
                                            filterFrom: "",
                                            filterTo: "",
                                            timePreference: "ANYTIME",
                                            dayPreference: "ANY_DAY",
                                        });
                                    }}
                                    disabled={pickupOptions.length === 0}
                                    className="inline-flex items-center gap-2 rounded-full border border-green-100 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:border-green-300 hover:text-[#2E7D32] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <Route className="h-4 w-4" />
                                    All routes, all dates
                                </button>
                                <button
                                    type="button"
                                    onClick={async () => {
                                        const firstPickupId = pickupOptions[0] ? String(pickupOptions[0].logisticsid) : "";
                                        setFilterFrom("");
                                        setFilterTo("");
                                        setTimePreference("ANYTIME");
                                        setDayPreference("ANY_DAY");
                                        setScheduleScope("ALL_DATES");
                                        setRouteMode("SINGLE");
                                        setSelectedLogisticsId(firstPickupId);
                                        await fetchRoutePlan({
                                            routeMode: "SINGLE",
                                            selectedLogisticsId: firstPickupId,
                                            scheduleScope: "ALL_DATES",
                                            filterFrom: "",
                                            filterTo: "",
                                            timePreference: "ANYTIME",
                                            dayPreference: "ANY_DAY",
                                        });
                                    }}
                                    className="inline-flex items-center gap-2 rounded-full border border-green-100 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:border-green-300 hover:text-[#2E7D32]"
                                >
                                    Reset planner
                                </button>
                            </div>
                        </div>
                    </div>

                    {routeLoading ? (
                        <div className="mt-6 rounded-2xl border border-dashed border-green-200 bg-[#F9FFF7] px-5 py-10 text-center text-slate-500">
                            Calculating road routes...
                        </div>
                    ) : routeError ? (
                        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                            {routeError}
                        </div>
                    ) : routePlan?.routeCount > 0 ? (
                        <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                            <div className="overflow-hidden rounded-[24px] border border-green-100">
                                <MapContainer center={mapCenter} zoom={11} scrollWheelZoom style={{ height: "420px", width: "100%" }}>
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />

                                    <Marker position={[routePlan.hubLatitude, routePlan.hubLongitude]}>
                                        <Popup>{routePlan.hubLocation || "NGO base"}</Popup>
                                    </Marker>

                                    {routePlan.routes.map((route, routeIndex) => (
                                        <Fragment key={route.routeKey}>
                                            {route.stops.map((stop) => (
                                                <Marker key={`${route.routeKey}-${stop.logisticsId}`} position={[stop.latitude, stop.longitude]}>
                                                    <Popup>
                                                        <div className="space-y-1">
                                                            <p className="font-semibold">{stop.donationTitle}</p>
                                                            <p className="text-sm">{stop.addressLine}</p>
                                                            <p className="text-xs text-slate-500">{stop.donorUsername}</p>
                                                        </div>
                                                    </Popup>
                                                </Marker>
                                            ))}
                                            {route.path?.length > 1 && (
                                                <Polyline
                                                    positions={route.path.map((point) => [point.latitude, point.longitude])}
                                                    pathOptions={{
                                                        color: routeColors[routeIndex % routeColors.length],
                                                        weight: 5,
                                                        opacity: 0.85,
                                                    }}
                                                />
                                            )}
                                        </Fragment>
                                    ))}
                                </MapContainer>
                            </div>

                            <div className="space-y-4">
                                <div className="rounded-[24px] border border-green-100 bg-[#F9FFF7] p-5">
                                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#2E7D32]">Planning summary</p>
                                    <div className="mt-4 space-y-3 text-sm text-slate-700">
                                        <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
                                            <Route className="h-4 w-4 text-[#2E7D32]" />
                                            <span>{routePlan.routeCount} planned route{routePlan.routeCount === 1 ? "" : "s"}</span>
                                        </div>
                                        <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
                                            <Clock3 className="h-4 w-4 text-[#2E7D32]" />
                                            <span>{routePlan.totalDurationMinutes} minutes total road time</span>
                                        </div>
                                        <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
                                            <MapPin className="h-4 w-4 text-[#2E7D32]" />
                                            <span>{routePlan.totalDistanceKm} km total road distance</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-[24px] border border-green-100 bg-white p-5">
                                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#2E7D32]">
                                        {routeMode === "ALL" ? "Individual road paths" : routeMode === "SINGLE" ? "Selected donation path" : "Optimized trip order"}
                                    </p>
                                    <div className="mt-4 space-y-4">
                                        {routePlan.routes.map((route, routeIndex) => (
                                            <div key={route.routeKey} className="rounded-2xl border border-slate-100 bg-[#FFFDF9] p-4">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="h-3 w-3 rounded-full"
                                                        style={{ backgroundColor: routeColors[routeIndex % routeColors.length] }}
                                                    />
                                                    <div>
                                                        <p className="font-semibold text-slate-900">{route.label}</p>
                                                        <p className="text-sm text-slate-500">
                                                            {route.totalDistanceKm} km, {route.totalDurationMinutes} min
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mt-4 space-y-3">
                                                    {route.stops.map((stop) => (
                                                        <div key={stop.logisticsId} className="rounded-2xl bg-white p-4 shadow-sm">
                                                            <p className="font-semibold text-slate-900">
                                                                {routeMode === "OPTIMIZED" ? `Stop ${stop.sequence}: ` : ""}
                                                                {stop.donationTitle}
                                                            </p>
                                                            <p className="mt-1 text-sm text-slate-600">{stop.addressLine}</p>
                                                            <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-slate-500">
                                                                <span className="rounded-full bg-slate-100 px-3 py-1">Donor: {stop.donorUsername}</span>
                                                                <span className="rounded-full bg-slate-100 px-3 py-1">
                                                                    {formatAvailability(stop)}
                                                                </span>
                                                                <span className="rounded-full bg-slate-100 px-3 py-1">
                                                                    {prettyPreference(stop.timePreference)}
                                                                </span>
                                                                <span className="rounded-full bg-slate-100 px-3 py-1">
                                                                    {prettyPreference(stop.dayPreference)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-6 rounded-2xl border border-dashed border-green-200 bg-[#F9FFF7] px-5 py-10 text-center">
                            <Route className="mx-auto h-10 w-10 text-green-200" />
                            <p className="mt-4 text-lg font-semibold text-slate-800">
                                {pickupOptions.length === 0
                                    ? "No pickup donations are ready for routing yet."
                                    : routeMode !== "SINGLE" && scheduleScope === "SCHEDULED_RANGE"
                                        ? "No routes match the selected schedule window."
                                        : "No routes are available right now."}
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                                {pickupOptions.length === 0
                                    ? "Only accepted pickup donations with pinned map locations will appear here."
                                    : routeMode !== "SINGLE" && scheduleScope === "SCHEDULED_RANGE"
                                        ? "Try widening the date range or switch to All dates."
                                        : "Select a pickup item or use All routes, all dates to view road paths."}
                            </p>
                        </div>
                    )}
                </section>

                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-dashed border-gray-300">
                        <Package size={64} className="text-gray-200 mb-4" />
                        <p className="text-gray-500 text-lg font-medium">No logistics records found.</p>
                        <p className="text-gray-400 text-sm mt-1">Accepted donations with pickup/drop-off logistics will appear here.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items.map((item) => {
                            const status = item.deliverystatus?.toUpperCase() || "PENDING";
                            const nextStatus = getNextStatus(status, item.method);
                            const isUpdating = updatingId === item.logisticsid;
                            const canRouteItem = isRoutablePickup(item);

                            return (
                                <div key={item.logisticsid} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all flex flex-col">
                                    {item.donationId && (
                                        <div
                                            className="h-48 w-full relative bg-gray-50 border-b border-gray-100 flex-shrink-0 overflow-hidden z-0 cursor-pointer group"
                                            onClick={() => handleViewDetails(item.donationId)}
                                        >
                                            <DonationImage donationId={item.donationId} title={item.donationTitle} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                                <span className="opacity-0 group-hover:opacity-100 bg-white/95 px-4 py-1.5 rounded-full text-xs font-bold shadow-lg text-gray-800 transition-all transform translate-y-2 group-hover:translate-y-0 duration-300">
                                                    View Details
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    <div className={`px-5 py-3 flex items-center justify-between z-10 relative ${statusColors[status] || "bg-gray-100 text-gray-700"}`}>
                                        <span className="text-xs font-bold uppercase tracking-widest">{status.replace("_", " ")}</span>
                                        <Truck className="w-4 h-4 opacity-70" />
                                    </div>

                                    <div className="p-5 flex flex-col flex-grow gap-4">
                                        {item.donationTitle && (
                                            <div className="mb-2 border-b border-gray-50 pb-4">
                                                <h3 className="text-xl font-bold text-gray-800 line-clamp-2 leading-tight pt-1">{item.donationTitle}</h3>
                                                <div className="flex items-center gap-3 mt-2 text-sm text-gray-500 font-medium">
                                                    <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">{item.category || "General Item"}</span>
                                                    {item.donorUsername && (
                                                        <span className="flex items-center gap-1">
                                                            <User className="w-3.5 h-3.5" />
                                                            {item.donorUsername}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        <div>
                                            <span className="text-xs font-semibold text-gray-400 uppercase">Method</span>
                                            <p className="font-semibold text-gray-800 mt-0.5">{item.method || "-"}</p>
                                        </div>

                                        {item.addressLine && (
                                            <div className="flex items-start gap-2 text-sm text-gray-600">
                                                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                                <span>{item.addressLine}</span>
                                            </div>
                                        )}

                                        <div className="rounded-2xl bg-[#F9FFF7] p-4 text-sm text-slate-700">
                                            <p className="font-semibold text-slate-900">Availability</p>
                                            <p className="mt-1">{formatAvailability(item)}</p>
                                            <div className="mt-2 flex flex-wrap gap-2 text-xs font-medium text-slate-500">
                                                <span className="rounded-full bg-white px-3 py-1">{prettyPreference(item.timePreference)}</span>
                                                <span className="rounded-full bg-white px-3 py-1">{prettyPreference(item.dayPreference)}</span>
                                            </div>
                                        </div>

                                        <div className="text-xs text-gray-400 border-t border-gray-50 pt-3">
                                            <p>Created: {new Date(item.createdAt).toLocaleDateString()}</p>
                                            {item.updatedByUsername && (
                                                <p className="mt-0.5">Last updated by: <span className="font-medium text-gray-500">{item.updatedByUsername}</span></p>
                                            )}
                                        </div>

                                        {canRouteItem && (
                                            <button
                                                onClick={() => focusRouteOnItem(item.logisticsid)}
                                                className="mt-auto w-full rounded-xl border border-green-200 bg-[#F9FFF7] py-2.5 text-sm font-semibold text-[#2E7D32] transition-all hover:border-green-300 hover:bg-[#F1F8EE]"
                                            >
                                                Show route
                                            </button>
                                        )}

                                        {nextStatus && (
                                            <button
                                                onClick={() => handleStatusUpdate(item.logisticsid, nextStatus)}
                                                disabled={isUpdating}
                                                className={`${canRouteItem ? "mt-3" : "mt-auto"} w-full py-2.5 rounded-xl bg-[#2E7D32] text-white font-semibold text-sm hover:bg-[#1B5E20] transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-green-200`}
                                            >
                                                {isUpdating ? "Updating..." : `Mark as ${nextStatus.replace("_", " ")}`}
                                            </button>
                                        )}

                                        {(status === "DELIVERED" || status === "RECEIVED") && (
                                            <div className="mt-auto w-full py-2.5 rounded-xl bg-green-50 text-green-700 font-semibold text-sm text-center border border-green-200">
                                                ✓ {status === "RECEIVED" ? "Received" : "Delivered"}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Logistics;
