import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import ProfileImage from "../../components/common/ProfileImage";
import { ArrowLeft } from 'lucide-react';

const Profile = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const userid = localStorage.getItem("userid");

    useEffect(() => {
        if (!userid) {
            navigate("/login");
            return;
        }

        const fetchProfile = async () => {
            try {
                const response = await api.get(`/users/${userid}`);
                setUserData(response.data);
            } catch (error) {
                console.error("Error fetching profile data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [userid, navigate]);

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

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#FFF8F0] to-[#E8F5E9] py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-gray-600 hover:text-green-700 font-medium mb-6 transition-colors group"
                >
                    <ArrowLeft className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" />
                    Back
                </button>

                {/* Main Card with softened shadow */}
                <div style={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)' }} className="bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/50 transform transition-all hover:scale-[1.01] duration-300">

                    {/* Header Banner - Subtle Gradient */}
                    <div className="h-48 bg-gradient-to-r from-[#215d25] via-[#2E7D32] to-[#3b9f40] relative overflow-hidden">
                        <div className="absolute inset-0 bg-black/10"></div>
                        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-white/20 rounded-full blur-3xl"></div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-green-300/20 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                    </div>

                    {/* Profile Info Section */}
                    <div className="px-8 pb-12">
                        <div className="relative flex justify-center -mt-24 mb-6">
                            <div className="relative p-1.5 bg-white rounded-full">
                                <ProfileImage
                                    userid={userid}
                                    username={userData.username}
                                    className="w-40 h-40 rounded-full border-4 border-white object-cover"
                                />
                                {/* Status Indicator on Avatar */}
                                <div className="absolute bottom-4 right-4 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></div>
                            </div>
                        </div>

                        <div className="text-center mb-10">
                            {/* Capitalized Name & Darker Color */}
                            <h1 className="text-4xl font-extrabold text-[#111827] mb-2 tracking-tight capitalize">
                                {userData.username}
                            </h1>
                            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-green-50/80 text-green-700 text-sm font-bold border border-green-100 shadow-sm backdrop-blur-sm">
                                {userData.role}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                            {/* Info Cards with updated background, padding and typography */}
                            <div className="group bg-[#f9fafb] p-8 rounded-2xl border border-gray-100 hover:border-green-200 hover:shadow-md transition-all duration-300">
                                <p className="text-sm font-semibold text-[#6B7280] uppercase tracking-[0.05em] mb-2">Phone</p>
                                <p className="text-lg font-medium text-gray-800">{userData.phone || "Not provided"}</p>
                            </div>

                            <div className="group bg-[#f9fafb] p-8 rounded-2xl border border-gray-100 hover:border-green-200 hover:shadow-md transition-all duration-300">
                                <p className="text-sm font-semibold text-[#6B7280] uppercase tracking-[0.05em] mb-2">Location</p>
                                <p className="text-lg font-medium text-gray-800">{userData.location || "Not provided"}</p>
                            </div>

                            {userData.role !== 'DONOR' && userData.licenceno && (
                                <div className="group bg-[#f9fafb] p-8 rounded-2xl border border-gray-100 hover:border-green-200 hover:shadow-md transition-all duration-300">
                                    <p className="text-sm font-semibold text-[#6B7280] uppercase tracking-[0.05em] mb-2">License No</p>
                                    <p className="text-lg font-medium text-gray-800">{userData.licenceno}</p>
                                </div>
                            )}

                            {userData.website && (
                                <div className="group bg-[#f9fafb] p-8 rounded-2xl border border-gray-100 hover:border-green-200 hover:shadow-md transition-all duration-300">
                                    <p className="text-sm font-semibold text-[#6B7280] uppercase tracking-[0.05em] mb-2">Website</p>
                                    <a href={userData.website} target="_blank" rel="noopener noreferrer" className="text-lg font-medium text-green-600 hover:text-green-700 flex flex-wrap break-all underline decoration-green-300 underline-offset-4">
                                        {userData.website}
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
