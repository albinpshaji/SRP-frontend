import { useEffect, useState } from "react";
import { ArrowLeft, Camera, MapPin, PencilLine, Save, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import ProfileImage from "../../components/common/ProfileImage";
import DonorProgressCard from "../../components/donor/DonorProgressCard";
import ProfileLocationEditor from "../../components/profile/ProfileLocationEditor";
import { useToast } from "../../context/ToastContext";

const createFormState = (user) => ({
    username: user?.username || "",
    phone: user?.phone || "",
    location: user?.location || "",
    latitude: user?.latitude !== null && user?.latitude !== undefined ? String(user.latitude) : "",
    longitude: user?.longitude !== null && user?.longitude !== undefined ? String(user.longitude) : "",
    website: user?.website || "",
    licenceno: user?.licenceno || "",
});

const getVerificationLabel = (status, role) => {
    if (role === "DONOR") {
        return "Community member";
    }
    if (status === "VERIFIED") {
        return "Verified NGO";
    }
    if (status === "REJECTED") {
        return "Verification rejected";
    }
    return "Verification pending";
};

const parseCoordinate = (value) => {
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
};

function Profile() {
    const [userData, setUserData] = useState(null);
    const [donorStats, setDonorStats] = useState(null);
    const [form, setForm] = useState(createFormState(null));
    const [isEditing, setIsEditing] = useState(false);
    const [selectedProfilePic, setSelectedProfilePic] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();
    const { showToast } = useToast();

    const userid = localStorage.getItem("userid");
    const token = localStorage.getItem("jwt_token");

    const loadProfile = async () => {
        if (!token) {
            navigate("/login");
            return;
        }

        setLoading(true);
        try {
            const response = await api.get("/users/profile/me");
            setUserData(response.data);
            setForm(createFormState(response.data));

            if (response.data?.role === "DONOR") {
                try {
                    const gamificationResponse = await api.get("/gamification/me");
                    setDonorStats(gamificationResponse.data);
                } catch (gamificationError) {
                    console.error("Error fetching donor stats:", gamificationError);
                    setDonorStats(null);
                }
            } else {
                setDonorStats(null);
            }
        } catch (error) {
            console.error("Error fetching profile data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProfile();
    }, [token]);

    const updateForm = (key, value) => {
        setForm((current) => ({
            ...current,
            [key]: value,
        }));
    };

    const cancelEditing = () => {
        setForm(createFormState(userData));
        setSelectedProfilePic(null);
        setIsEditing(false);
    };

    const saveProfile = async (event) => {
        event.preventDefault();

        if (form.username.trim().length < 3) {
            showToast("Username must be at least 3 characters", "error");
            return;
        }

        if (!/^\d{10}$/.test(form.phone.trim())) {
            showToast("Phone number must be exactly 10 digits", "error");
            return;
        }

        const latitude = parseCoordinate(form.latitude);
        const longitude = parseCoordinate(form.longitude);

        if (latitude === null || longitude === null) {
            showToast("Latitude and longitude must be valid numbers", "error");
            return;
        }

        setSaving(true);
        try {
            const formData = new FormData();
            const payload = {
                username: form.username.trim(),
                phone: form.phone.trim(),
                location: form.location.trim(),
                latitude,
                longitude,
                website: userData?.role !== "DONOR" ? form.website.trim() : null,
                licenceno: userData?.role !== "DONOR" ? form.licenceno : null,
            };

            formData.append("user", new Blob([JSON.stringify(payload)], { type: "application/json" }));
            if (selectedProfilePic) {
                formData.append("profilepic", selectedProfilePic);
            }

            const response = await api.put("/users/me", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            localStorage.setItem("jwt_token", response.data.token);
            localStorage.setItem("role", response.data.role);
            localStorage.setItem("userid", response.data.userid);

            await loadProfile();
            setSelectedProfilePic(null);
            setIsEditing(false);
            showToast("Profile updated successfully", "success");
        } catch (error) {
            console.error("Profile update failed", error);
            showToast(error.response?.data || "Failed to update profile", "error");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FFF8F0]">
                <div className="w-16 h-16 border-4 border-[#2E7D32] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!userData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FFF8F0]">
                <div className="text-xl font-semibold text-gray-500">Failed to load profile.</div>
            </div>
        );
    }

    const isDonor = userData.role === "DONOR";
    const verificationLabel = getVerificationLabel(userData.isverified, userData.role);

    return (
        <div className="min-h-screen bg-[#FFF8F0] px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 inline-flex items-center gap-2 rounded-full border border-green-100 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-green-200 hover:text-[#2E7D32]"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </button>

                <section className="overflow-hidden rounded-[36px] border border-green-100 bg-white shadow-[0_20px_50px_-30px_rgba(46,125,50,0.25)]">
                    <div className="bg-[#E8F5E9] px-6 py-8 sm:px-10">
                        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                                <div className="relative">
                                    <div className="rounded-full border border-white bg-white/85 p-2 shadow-lg">
                                        <ProfileImage
                                            userid={userData.userid || userid}
                                            username={userData.username}
                                            className="h-28 w-28 rounded-full object-cover border-4 border-white"
                                        />
                                    </div>
                                    <div className="absolute bottom-2 right-1 rounded-full bg-[#C8E6C9] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#1B5E20]">
                                        Active
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#2E7D32]">
                                        {isDonor ? "Donor profile" : "NGO profile"}
                                    </p>
                                    <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
                                        {userData.username}
                                    </h1>
                                    <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                                        <span className="rounded-full border border-green-100 bg-white px-4 py-2 font-semibold text-[#2E7D32]">
                                            {userData.role}
                                        </span>
                                        <span className="rounded-full border border-green-100 bg-white px-4 py-2 font-semibold text-[#2E7D32]">
                                            {verificationLabel}
                                        </span>
                                        <span className="inline-flex items-center gap-2 rounded-full border border-green-100 bg-white px-4 py-2 font-semibold text-slate-700">
                                            <MapPin className="h-4 w-4 text-[#2E7D32]" />
                                            {userData.location || "Location not set"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                </section>

                <section className="mt-8 rounded-[32px] border border-green-100 bg-white p-6 shadow-sm sm:p-8">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#2E7D32]">Account details</p>
                            <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                                {isEditing ? "Update your profile in one place" : "Your profile details"}
                            </h2>
                            <p className="mt-2 max-w-3xl text-sm text-slate-600">
                                {isDonor
                                    ? "This is the same information donors and NGOs rely on when coordinating a donation with you."
                                    : "This is the same information donors see when deciding whether to trust and contact your organisation."}
                            </p>
                        </div>
                        <span className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${isEditing ? "bg-[#E8F5E9] text-[#2E7D32]" : "bg-slate-100 text-slate-600"}`}>
                            {isEditing ? "Editing" : "Read only"}
                        </span>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                        {!isEditing ? (
                            <button
                                type="button"
                                onClick={() => setIsEditing(true)}
                                className="inline-flex items-center gap-2 rounded-full bg-[#2E7D32] px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#1B5E20]"
                            >
                                <PencilLine className="h-4 w-4" />
                                Edit profile
                            </button>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={cancelEditing}
                                    className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-green-300 hover:text-[#2E7D32]"
                                >
                                    <X className="h-4 w-4" />
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    form="profile-edit-form"
                                    disabled={saving}
                                    className="inline-flex items-center gap-2 rounded-full bg-[#2E7D32] px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#1B5E20] disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    <Save className="h-4 w-4" />
                                    {saving ? "Saving..." : "Save changes"}
                                </button>
                            </>
                        )}
                    </div>

                    <form id="profile-edit-form" onSubmit={saveProfile} className="mt-8 space-y-8">
                        <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr]">
                            <div className="space-y-5">
                                <div className="rounded-[28px] border border-green-100 bg-[#F9FFF7] p-5">
                                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#2E7D32]">Profile photo</p>
                                    <p className="mt-1 text-sm text-slate-500">Keep your account recognizable with a clear profile image.</p>
                                    <div className="mt-5 flex items-center gap-4">
                                        <div className="rounded-full border border-white bg-white p-2 shadow-sm">
                                            <ProfileImage
                                                userid={userData.userid || userid}
                                                username={userData.username}
                                                className="h-24 w-24 rounded-full object-cover border-4 border-white"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <p className="text-sm font-medium text-slate-700">
                                                {selectedProfilePic ? selectedProfilePic.name : "No new image selected"}
                                            </p>
                                            <label className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${isEditing ? "cursor-pointer border-green-100 bg-white text-slate-700 hover:border-green-300 hover:text-[#2E7D32]" : "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"}`}>
                                                <Camera className="h-4 w-4" />
                                                {selectedProfilePic ? "Change photo" : "Choose photo"}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    disabled={!isEditing}
                                                    className="hidden"
                                                    onChange={(event) => setSelectedProfilePic(event.target.files?.[0] || null)}
                                                />
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-[28px] border border-green-100 bg-[#F9FFF7] p-5 text-sm text-slate-700">
                                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#2E7D32]">Profile notes</p>
                                    <div className="mt-4 space-y-3">
                                        <p>Keep your name short and recognizable so people can identify you quickly.</p>
                                        <p>Update your map pin whenever your pickup or drop-off point changes.</p>
                                        {!isDonor && <p>Your licence number stays locked here. If your documents change, use the admin verification flow.</p>}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="grid gap-5 md:grid-cols-2">
                                    <label className="block">
                                        <span className="mb-2 block text-sm font-semibold text-slate-700">Display name</span>
                                        <input
                                            type="text"
                                            value={form.username}
                                            disabled={!isEditing}
                                            onChange={(event) => updateForm("username", event.target.value)}
                                            className="w-full rounded-2xl border border-slate-200 bg-[#fafaf8] px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-green-400 focus:ring-4 focus:ring-green-100 disabled:bg-slate-50"
                                        />
                                    </label>
                                    <label className="block">
                                        <span className="mb-2 block text-sm font-semibold text-slate-700">Phone number</span>
                                        <input
                                            type="text"
                                            value={form.phone}
                                            disabled={!isEditing}
                                            onChange={(event) => updateForm("phone", event.target.value)}
                                            className="w-full rounded-2xl border border-slate-200 bg-[#fafaf8] px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-green-400 focus:ring-4 focus:ring-green-100 disabled:bg-slate-50"
                                        />
                                    </label>
                                </div>

                                {!isDonor && (
                                    <div className="grid gap-5 md:grid-cols-2">
                                        <label className="block">
                                            <span className="mb-2 block text-sm font-semibold text-slate-700">Website</span>
                                            <input
                                                type="text"
                                                value={form.website}
                                                disabled={!isEditing}
                                                onChange={(event) => updateForm("website", event.target.value)}
                                                placeholder="https://your-ngo.org"
                                                className="w-full rounded-2xl border border-slate-200 bg-[#fafaf8] px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-green-400 focus:ring-4 focus:ring-green-100 disabled:bg-slate-50"
                                            />
                                        </label>
                                        <label className="block">
                                            <span className="mb-2 block text-sm font-semibold text-slate-700">Licence number</span>
                                            <input
                                                type="text"
                                                value={form.licenceno}
                                                disabled
                                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 outline-none"
                                            />
                                        </label>
                                    </div>
                                )}

                                <ProfileLocationEditor
                                    roleLabel={isDonor ? "donor" : "NGO"}
                                    location={form.location}
                                    latitude={form.latitude}
                                    longitude={form.longitude}
                                    setLocation={(value) => updateForm("location", value)}
                                    setLatitude={(value) => updateForm("latitude", value)}
                                    setLongitude={(value) => updateForm("longitude", value)}
                                    disabled={!isEditing}
                                />
                            </div>
                        </div>
                    </form>
                </section>

                {isDonor && donorStats && (
                    <div className="mt-8">
                        <DonorProgressCard stats={donorStats} />
                    </div>
                )}
            </div>
        </div>
    );
}

export default Profile;
