import { useEffect, useRef, useState } from "react";
import api from "../../services/api";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import donateVisual from "../../assets/loginimage.jpg";
import { useToast } from "../../context/ToastContext";
import ProfileLocationEditor from "../../components/profile/ProfileLocationEditor";

const normalizeRequirement = (requirement) => {
    if (!requirement) return null;

    return {
        requirementid: requirement.requirementid ?? requirement.requirementId,
        title: requirement.title ?? requirement.requirementTitle,
        category: requirement.category ?? "Other",
        urgency: requirement.urgency ?? "NORMAL",
        quantity: requirement.quantity ?? 0,
        fulfilledQuantity: requirement.fulfilledQuantity ?? 0,
        userid: requirement.userid ?? requirement.ngoUserId,
        username: requirement.username ?? requirement.ngoUsername,
        ngoLocation: requirement.ngoLocation ?? requirement.location ?? "",
        score: requirement.score ?? null,
        confidence: requirement.confidence ?? null,
        reasons: Array.isArray(requirement.reasons) ? requirement.reasons : [],
        fitSummary: requirement.fitSummary ?? "",
        missingInfo: Array.isArray(requirement.missingInfo) ? requirement.missingInfo : [],
        distanceKm: requirement.distanceKm ?? null,
    };
};

const DEFAULT_CATEGORY = "Food";

const maxRemainingQuantity = (requirement) => {
    if (!requirement) return 1;
    const quantity = Number(requirement.quantity ?? 0);
    const fulfilledQuantity = Number(requirement.fulfilledQuantity ?? 0);
    return Math.max(1, quantity - fulfilledQuantity);
};

function Donateitems() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { showToast } = useToast();

    const lockedRequirement = normalizeRequirement(location.state?.requirement);
    const isDirectDonation = Boolean(id);

    const [title, setTitle] = useState(lockedRequirement ? lockedRequirement.title : "");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState(lockedRequirement ? lockedRequirement.category : "Food");
    const [logistics, setLogistics] = useState("Dropoff");
    const [pickuplocation, setPickupLocation] = useState("");
    const [pickupLatitude, setPickupLatitude] = useState("");
    const [pickupLongitude, setPickupLongitude] = useState("");
    const [pickupdate, setPickupdate] = useState("");
    const [availabilityStart, setAvailabilityStart] = useState("");
    const [availabilityEnd, setAvailabilityEnd] = useState("");
    const [timePreference, setTimePreference] = useState("ANYTIME");
    const [dayPreference, setDayPreference] = useState("ANY_DAY");
    const [imageFile, setImageFile] = useState(null);
    const [quantityProvided, setQuantityProvided] = useState(1);
    const [loading, setLoading] = useState(false);
    const [defaultPickup, setDefaultPickup] = useState(null);
    const [selectedRequirement, setSelectedRequirement] = useState(lockedRequirement);
    const [selectedRequirementSource, setSelectedRequirementSource] = useState(lockedRequirement ? "locked" : null);
    const [aiMatches, setAiMatches] = useState([]);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState("");
    const [aiFallbackUsed, setAiFallbackUsed] = useState(false);
    const [aiRetryAfterSeconds, setAiRetryAfterSeconds] = useState(null);
    const [aiHasRequested, setAiHasRequested] = useState(false);
    const aiPreviewCacheRef = useRef(new Map());
    const aiRateLimitUntilRef = useRef(0);

    const activeRequirement = selectedRequirement;
    const shouldShowAiSuggestions = !lockedRequirement;
    const currentNgoId = isDirectDonation ? Number(id) : null;

    let pageTitle = isDirectDonation ? "Donate to NGO" : "List on Marketplace";
    if (lockedRequirement) {
        pageTitle = "Fulfill NGO Requirement";
    } else if (selectedRequirementSource === "ai") {
        pageTitle = "Match Donation to NGO Need";
    }

    const submitBtnText = isDirectDonation ? "Confirm Donation" : "List Item";
    const successRedirect = isDirectDonation ? "/ngos" : "/mydonations";

    useEffect(() => {
        if (lockedRequirement) {
            setSelectedRequirement(lockedRequirement);
            setSelectedRequirementSource("locked");
            setQuantityProvided(1);
        }
    }, [lockedRequirement]);

    useEffect(() => {
        if (!activeRequirement) {
            setQuantityProvided(1);
            return;
        }

        const maxQuantity = maxRemainingQuantity(activeRequirement);
        setQuantityProvided((currentValue) => {
            const numericValue = Number(currentValue || 1);
            return String(Math.min(Math.max(1, numericValue), maxQuantity));
        });
    }, [activeRequirement]);

    useEffect(() => {
        if (logistics === "Dropoff") {
            setPickupLocation("");
            setPickupLatitude("");
            setPickupLongitude("");
            setPickupdate("");
            return;
        }

        if (defaultPickup && !pickupLatitude && !pickupLongitude) {
            setPickupLocation(defaultPickup.location || "");
            setPickupLatitude(defaultPickup.latitude || "");
            setPickupLongitude(defaultPickup.longitude || "");
        }
    }, [logistics, defaultPickup, pickupLatitude, pickupLongitude]);

    useEffect(() => {
        const loadDefaultPickup = async () => {
            try {
                const response = await api.get("/users/profile/me");
                if (
                    response.data?.latitude !== null
                    && response.data?.latitude !== undefined
                    && response.data?.longitude !== null
                    && response.data?.longitude !== undefined
                ) {
                    const defaults = {
                        location: response.data.location || "",
                        latitude: String(response.data.latitude),
                        longitude: String(response.data.longitude),
                    };
                    setDefaultPickup(defaults);
                    if (logistics === "Pickup") {
                        setPickupLocation(defaults.location);
                        setPickupLatitude(defaults.latitude);
                        setPickupLongitude(defaults.longitude);
                    }
                }
            } catch (error) {
                console.error("Failed to load default pickup location", error);
            }
        };

        loadDefaultPickup();
    }, [logistics]);

    const buildAiPayload = () => {
        const trimmedTitle = title.trim();
        const trimmedDescription = description.trim();
        const trimmedCategory = category.trim();
        const hasMeaningfulCategory = trimmedCategory && trimmedCategory !== DEFAULT_CATEGORY;
        const hasEnoughSignal = trimmedTitle.length >= 3 && (trimmedDescription.length >= 12 || hasMeaningfulCategory);

        if (!hasEnoughSignal) {
            return null;
        }

        return {
            title: trimmedTitle,
            category: trimmedCategory || null,
            description: trimmedDescription || null,
            pickupLatitude: logistics === "Pickup" && pickupLatitude ? parseFloat(pickupLatitude) : null,
            pickupLongitude: logistics === "Pickup" && pickupLongitude ? parseFloat(pickupLongitude) : null,
            ngoId: currentNgoId || null,
        };
    };

    useEffect(() => {
        if (!shouldShowAiSuggestions) {
            return;
        }

        if (!buildAiPayload()) {
            setAiMatches([]);
            setAiError("");
            setAiFallbackUsed(false);
            setAiLoading(false);
            setAiRetryAfterSeconds(null);
            setAiHasRequested(false);
        }
    }, [
        title,
        description,
        category,
        logistics,
        pickupLatitude,
        pickupLongitude,
        currentNgoId,
        shouldShowAiSuggestions,
    ]);

    const handleFetchAiSuggestions = async () => {
        const payload = buildAiPayload();
        if (!payload) {
            setAiMatches([]);
            setAiError("Add a title and a better category or description before running AI matching.");
            setAiFallbackUsed(false);
            setAiRetryAfterSeconds(null);
            setAiHasRequested(false);
            return;
        }

        const remainingCooldownMs = aiRateLimitUntilRef.current - Date.now();
        if (remainingCooldownMs > 0) {
            setAiLoading(false);
            setAiFallbackUsed(true);
            setAiRetryAfterSeconds(Math.ceil(remainingCooldownMs / 1000));
            setAiError("");
            setAiHasRequested(true);
            return;
        }

        setAiHasRequested(true);
        setAiLoading(true);
        setAiError("");
        setAiRetryAfterSeconds(null);

        try {
            const payloadKey = JSON.stringify(payload);

            if (aiPreviewCacheRef.current.has(payloadKey)) {
                const cached = aiPreviewCacheRef.current.get(payloadKey);
                setAiMatches(cached.matches);
                setAiFallbackUsed(cached.fallbackUsed);
                setAiRetryAfterSeconds(cached.retryAfterSeconds ?? null);
                setAiLoading(false);
                return;
            }

            const response = await api.post("/ai/recommendations/requirements/preview", payload);

            const matches = Array.isArray(response.data?.matches)
                ? response.data.matches.map(normalizeRequirement)
                : [];
            const retryAfterSeconds = Number.isFinite(Number(response.data?.retryAfterSeconds))
                ? Number(response.data.retryAfterSeconds)
                : null;
            if (response.data?.rateLimited && retryAfterSeconds) {
                aiRateLimitUntilRef.current = Date.now() + (retryAfterSeconds * 1000);
            }
            aiPreviewCacheRef.current.set(payloadKey, {
                matches,
                fallbackUsed: Boolean(response.data?.fallbackUsed),
                retryAfterSeconds,
            });
            setAiMatches(matches);
            setAiFallbackUsed(Boolean(response.data?.fallbackUsed));
            setAiRetryAfterSeconds(retryAfterSeconds);
            setAiError("");
        } catch (error) {
            console.error("Failed to fetch AI requirement matches", error);
            setAiMatches([]);
            setAiFallbackUsed(false);
            setAiRetryAfterSeconds(null);
            setAiError("AI suggestions are unavailable right now.");
        } finally {
            setAiLoading(false);
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
            if (!allowedTypes.includes(file.type)) {
                showToast("Please upload a valid image (JPG, JPEG, or PNG).", "error");
                event.target.value = null;
                return;
            }
            setImageFile(file);
        }
    };

    const handleSelectAiRequirement = (requirement) => {
        const normalizedRequirement = normalizeRequirement(requirement);
        setSelectedRequirement(normalizedRequirement);
        setSelectedRequirementSource("ai");
        setQuantityProvided("1");
        showToast("AI match selected. You can still change or remove it before submitting.", "success");
    };

    const handleClearAiRequirement = () => {
        setSelectedRequirement(null);
        setSelectedRequirementSource(null);
        setQuantityProvided("1");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!imageFile) {
            showToast("Please upload an image of the item.", "error");
            return;
        }

        if (logistics === "Pickup" && !pickuplocation.trim()) {
            showToast("Please set a pickup location on the map.", "error");
            return;
        }

        if (logistics === "Pickup" && (!pickupLatitude || !pickupLongitude)) {
            showToast("Please drop the pickup pin on the map.", "error");
            return;
        }

        if (availabilityStart && availabilityEnd && new Date(availabilityEnd) < new Date(availabilityStart)) {
            showToast("Availability end must be after availability start.", "error");
            return;
        }

        if (activeRequirement) {
            const maxQuantity = maxRemainingQuantity(activeRequirement);
            if (!quantityProvided || Number(quantityProvided) < 1 || Number(quantityProvided) > maxQuantity) {
                showToast(`Quantity must be between 1 and ${maxQuantity}.`, "error");
                return;
            }
        }

        setLoading(true);

        try {
            const formData = new FormData();

            const donationData = {
                title,
                description,
                category,
                logistics: {
                    method: logistics,
                    address_line: logistics === "Pickup" ? pickuplocation : null,
                    pickupdate: logistics === "Pickup" && pickupdate ? pickupdate : null,
                    availabilityStart: availabilityStart || null,
                    availabilityEnd: availabilityEnd || null,
                    timePreference,
                    dayPreference,
                    pickupLatitude: logistics === "Pickup" ? parseFloat(pickupLatitude) : null,
                    pickupLongitude: logistics === "Pickup" ? parseFloat(pickupLongitude) : null,
                },
                recepientid: activeRequirement ? activeRequirement.userid : (isDirectDonation ? parseInt(id, 10) : null),
                requirementid: activeRequirement ? activeRequirement.requirementid : null,
                quantityProvided: activeRequirement ? parseInt(quantityProvided, 10) : null,
            };

            formData.append("data", new Blob([JSON.stringify(donationData)], {
                type: "application/json",
            }));

            formData.append("imagefile", imageFile);

            await api.post("/ngos/donate", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            showToast(isDirectDonation ? "Donation submitted successfully!" : "Item listed in marketplace successfully!", "success");
            navigate(successRedirect);
        } catch (error) {
            console.error("Upload failed:", error.response?.data || error.message);
            showToast(`Failed to submit: ${error.response?.data || "Server Error"}`, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-[#FFF8F0] p-4 sm:p-8 py-8 sm:py-12">
            <div className="flex flex-col md:flex-row w-full max-w-5xl bg-white rounded-[2rem] shadow-2xl overflow-hidden h-auto">
                <div className="w-full md:w-1/2 h-48 md:h-auto bg-[#E8F5E9] relative order-1">
                    <img src={donateVisual} alt="Donation visual" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="absolute bottom-6 left-6 text-white p-4">
                        <h3 className="text-2xl font-bold">{isDirectDonation ? "Support an NGO" : "Public Marketplace"}</h3>
                        <p className="text-sm opacity-90">
                            {isDirectDonation
                                ? "Your item will be sent directly to this organization."
                                : "Any verified NGO can request this item from the marketplace."}
                        </p>
                    </div>
                </div>

                <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col justify-center order-2">
                    <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center md:text-left">{pageTitle}</h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!lockedRequirement && (
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1">Item Title</label>
                                <input
                                    value={title}
                                    onChange={(event) => setTitle(event.target.value)}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-600 outline-none"
                                    placeholder="e.g. 20kg Rice Bags"
                                />
                            </div>
                        )}

                        {activeRequirement && (
                            <div className="bg-green-50/50 border border-green-100 rounded-2xl p-5 mb-6 shadow-sm">
                                <div className="flex justify-between items-start gap-4 mb-2">
                                    <div>
                                        <span className="bg-green-100 text-green-800 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
                                            {selectedRequirementSource === "ai" ? "AI Selected Need" : "Fulfilling Need"}
                                        </span>
                                        <h4 className="text-xl font-extrabold text-gray-900 mt-2 mb-1 line-clamp-2">{activeRequirement.title}</h4>
                                        <p className="text-sm font-medium text-gray-500">
                                            {activeRequirement.category}
                                            {activeRequirement.username ? ` • ${activeRequirement.username}` : ""}
                                        </p>
                                        {activeRequirement.fitSummary && (
                                            <p className="mt-3 text-sm text-gray-700 bg-white border border-green-100 rounded-xl px-4 py-3">
                                                {activeRequirement.fitSummary}
                                            </p>
                                        )}
                                    </div>

                                    {selectedRequirementSource === "ai" && (
                                        <button
                                            type="button"
                                            onClick={handleClearAiRequirement}
                                            className="shrink-0 px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>

                                <div className="mt-4 mb-5">
                                    <div className="flex justify-between text-sm font-bold text-gray-600 mb-1.5">
                                        <span>Fulfilled Progress</span>
                                        <span className="text-green-700">{activeRequirement.fulfilledQuantity || 0} / {activeRequirement.quantity} Fulfilled</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                        <div
                                            className="bg-green-600 h-2.5 rounded-full transition-all duration-500"
                                            style={{ width: `${Math.min(((activeRequirement.fulfilledQuantity || 0) / activeRequirement.quantity) * 100, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {selectedRequirementSource === "ai" && activeRequirement.reasons?.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {activeRequirement.reasons.map((reason) => (
                                            <span
                                                key={reason}
                                                className="rounded-full bg-white border border-green-100 px-3 py-1 text-xs font-semibold text-green-800"
                                            >
                                                {reason}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <div className="bg-white p-4 rounded-xl border border-green-50">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Quantity You Are Donating</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="1"
                                            max={maxRemainingQuantity(activeRequirement)}
                                            value={quantityProvided}
                                            onChange={(event) => setQuantityProvided(event.target.value)}
                                            required
                                            className="w-full px-4 pr-16 py-3 rounded-xl border-2 border-green-100 focus:border-green-500 focus:ring-0 outline-none text-lg font-bold text-gray-800 transition-colors"
                                            placeholder="Enter amount..."
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                            <span className="text-gray-400 font-medium">Items</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2 font-medium bg-gray-50 p-2 rounded-lg">
                                        Max needed: {maxRemainingQuantity(activeRequirement)}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">Item Image (JPG, PNG)</label>
                            <input
                                type="file"
                                accept=".jpg,.jpeg,.png"
                                onChange={handleFileChange}
                                required
                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {!lockedRequirement && (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-600 mb-1">Category</label>
                                    <select
                                        value={category}
                                        onChange={(event) => setCategory(event.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-green-600 outline-none"
                                    >
                                        <option value="Food">Food</option>
                                        <option value="Clothes">Clothes</option>
                                        <option value="Medicine">Medicine</option>
                                        <option value="Books">Books</option>
                                        <option value="Electronics">Electronics</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1">Logistics</label>
                                <select
                                    value={logistics}
                                    onChange={(event) => setLogistics(event.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-green-600 outline-none"
                                >
                                    <option value="Dropoff">I will Drop-off</option>
                                    <option value="Pickup">Pickup Required</option>
                                </select>
                            </div>

                            {logistics === "Dropoff" && (
                                <div className={`rounded-2xl border border-dashed border-green-200 bg-green-50/60 p-4 text-sm text-green-900 ${lockedRequirement ? "md:col-span-1" : "md:col-span-2"}`}>
                                    The NGO will expect you to bring the donation to their side, so no pickup point is needed.
                                </div>
                            )}

                            <div className="md:col-span-2 rounded-[24px] border border-green-100 bg-[#F9FFF7] p-5">
                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#2E7D32]">Handoff availability</p>
                                <p className="mt-1 text-sm text-slate-600">
                                    Tell the NGO when this donation can realistically be collected or dropped off.
                                </p>

                                <div className="mt-4 grid gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-600 mb-1">Available From</label>
                                        <input
                                            type="datetime-local"
                                            value={availabilityStart}
                                            onChange={(event) => setAvailabilityStart(event.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-600 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-600 mb-1">Available Until</label>
                                        <input
                                            type="datetime-local"
                                            value={availabilityEnd}
                                            onChange={(event) => setAvailabilityEnd(event.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-600 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-600 mb-1">Time Preference</label>
                                        <select
                                            value={timePreference}
                                            onChange={(event) => setTimePreference(event.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-green-600 outline-none"
                                        >
                                            <option value="ANYTIME">Anytime</option>
                                            <option value="MORNING">Morning</option>
                                            <option value="AFTERNOON">Afternoon</option>
                                            <option value="EVENING">Evening</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-600 mb-1">Day Preference</label>
                                        <select
                                            value={dayPreference}
                                            onChange={(event) => setDayPreference(event.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-green-600 outline-none"
                                        >
                                            <option value="ANY_DAY">Any day</option>
                                            <option value="WEEKDAYS_ONLY">Weekdays only</option>
                                            <option value="WEEKENDS_ONLY">Weekends only</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {logistics === "Pickup" && (
                                <>
                                    <div className="md:col-span-2">
                                        <ProfileLocationEditor
                                            roleLabel="pickup point"
                                            location={pickuplocation}
                                            latitude={pickupLatitude}
                                            longitude={pickupLongitude}
                                            setLocation={setPickupLocation}
                                            setLatitude={setPickupLatitude}
                                            setLongitude={setPickupLongitude}
                                            disabled={false}
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-gray-600 mb-1">Preferred Exact Pickup Date & Time (Optional)</label>
                                        <input
                                            type="datetime-local"
                                            value={pickupdate}
                                            onChange={(event) => setPickupdate(event.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-600 outline-none"
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">Description</label>
                            <textarea
                                value={description}
                                onChange={(event) => setDescription(event.target.value)}
                                rows="2"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 resize-none"
                                placeholder="Details about quantity, condition, expiry..."
                            />
                        </div>

                        {shouldShowAiSuggestions && (
                            <div className="rounded-[24px] border border-emerald-100 bg-[#F8FFF9] p-5">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#2E7D32]">Suggested NGO needs</p>
                                        <p className="mt-1 text-sm text-slate-600">
                                            AI ranks active requirements using your draft details. Run it when your donation draft is ready. It only suggests matches and never submits for you.
                                        </p>
                                    </div>
                                    {aiFallbackUsed && (
                                        <span className="shrink-0 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-800">
                                            Fallback
                                        </span>
                                    )}
                                </div>

                                <div className="mt-4 flex flex-wrap items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={handleFetchAiSuggestions}
                                        disabled={aiLoading}
                                        className="rounded-xl bg-[#2E7D32] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1B5E20] disabled:cursor-not-allowed disabled:bg-gray-400"
                                    >
                                        {aiLoading ? "Finding Matches..." : "Run AI Matching"}
                                    </button>
                                    <p className="text-xs text-slate-500">
                                        Manual trigger reduces Gemini quota usage while you edit the form.
                                    </p>
                                </div>

                                {aiFallbackUsed && (
                                    <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                                        {aiRetryAfterSeconds
                                            ? `Gemini is rate-limited right now, so these suggestions use the built-in matching logic. Retry in about ${aiRetryAfterSeconds}s.`
                                            : "Gemini is unavailable right now, so these suggestions use the built-in matching logic."}
                                    </p>
                                )}

                                {aiLoading && (
                                    <div className="mt-4 rounded-2xl border border-dashed border-green-200 bg-white px-4 py-6 text-sm font-medium text-gray-500">
                                        Finding the best NGO needs for this donation...
                                    </div>
                                )}

                                {!aiLoading && aiError && (
                                    <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
                                        {aiError}
                                    </div>
                                )}

                                {!aiLoading && !aiError && aiHasRequested && aiMatches.length === 0 && title.trim() && (
                                    <div className="mt-4 rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-6 text-sm text-gray-500">
                                        No strong requirement matches yet. Add more item details or keep listing it without a matched need.
                                    </div>
                                )}

                                {!aiLoading && !aiError && aiHasRequested && aiMatches.length > 0 && (
                                    <div className="mt-4 space-y-3">
                                        {aiMatches.map((match) => {
                                            const isSelected = activeRequirement?.requirementid === match.requirementid;
                                            return (
                                                <div
                                                    key={match.requirementid}
                                                    className={`rounded-2xl border p-4 transition-colors ${isSelected ? "border-green-400 bg-green-50/70" : "border-gray-200 bg-white"}`}
                                                >
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div>
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <h3 className="text-base font-bold text-gray-900">{match.title}</h3>
                                                                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-bold uppercase text-gray-600">
                                                                    {match.category}
                                                                </span>
                                                                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold uppercase text-emerald-700">
                                                                    {match.urgency}
                                                                </span>
                                                            </div>
                                                            <p className="mt-1 text-sm text-gray-600">
                                                                {match.username}
                                                                {match.distanceKm !== null ? ` • ${match.distanceKm.toFixed(1)} km away` : ""}
                                                            </p>
                                                        </div>

                                                        <div className="flex flex-col items-end gap-2">
                                                            <div className="rounded-xl bg-green-900 px-3 py-2 text-right text-white">
                                                                <p className="text-[11px] uppercase tracking-wide text-green-100">Match score</p>
                                                                <p className="text-lg font-bold">{match.score ?? "--"}</p>
                                                            </div>
                                                            {match.confidence && (
                                                                <span className="rounded-full bg-white border border-green-100 px-3 py-1 text-[11px] font-bold uppercase text-green-800">
                                                                    {match.confidence}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {match.fitSummary && (
                                                        <p className="mt-3 text-sm text-gray-700">{match.fitSummary}</p>
                                                    )}

                                                    {match.reasons?.length > 0 && (
                                                        <div className="mt-3 flex flex-wrap gap-2">
                                                            {match.reasons.map((reason) => (
                                                                <span
                                                                    key={`${match.requirementid}-${reason}`}
                                                                    className="rounded-full bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700 border border-gray-200"
                                                                >
                                                                    {reason}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {match.missingInfo?.length > 0 && (
                                                        <div className="mt-3 rounded-xl bg-gray-50 px-3 py-3 text-xs text-gray-600 border border-gray-100">
                                                            Missing info: {match.missingInfo.join(" • ")}
                                                        </div>
                                                    )}

                                                    <div className="mt-4 flex items-center justify-between gap-3">
                                                        <p className="text-xs text-gray-500">
                                                            Remaining needed: {maxRemainingQuantity(match)}
                                                        </p>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleSelectAiRequirement(match)}
                                                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${isSelected ? "bg-white border border-green-300 text-green-700" : "bg-[#2E7D32] text-white hover:bg-[#1B5E20]"}`}
                                                        >
                                                            {isSelected ? "Selected" : "Use This Match"}
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#2E7D32] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#1B5E20] transition-all shadow-lg active:scale-95 mt-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {loading ? "Processing..." : submitBtnText}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Donateitems;
