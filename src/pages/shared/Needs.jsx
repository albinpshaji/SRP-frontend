import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const Needs = () => {
    const [needs, setNeeds] = useState([]);
    const [loading, setLoading] = useState(true);
    const role = localStorage.getItem('role')?.toUpperCase();
    const navigate = useNavigate();

    useEffect(() => {
        fetchNeeds();
    }, []);

    const fetchNeeds = async () => {
        try {
            const response = await api.get('/requirements');
            setNeeds(response.data);
        } catch (error) {
            console.error('Error fetching needs:', error);
        } finally {
            setLoading(false);
        }
    };

    const getUrgencyColor = (urgency) => {
        switch (urgency) {
            case 'SOS': return 'bg-red-100 text-red-800 border-red-200';
            case 'URGENT': return 'bg-orange-100 text-orange-800 border-orange-200';
            default: return 'bg-blue-100 text-blue-800 border-blue-200';
        }
    };

    const handleDelete = async (reqId) => {
        if (!window.confirm("Are you sure you want to delete this requirement? If donations have already been made towards this, it will be marked as fulfilled instead of fully removed.")) return;

        try {
            await api.delete(`/requirements/${reqId}`);
            fetchNeeds();
        } catch (error) {
            console.error('Error deleting requirement:', error);
            alert("Failed to delete requirement.");
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen bg-[#FFF8F0]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2E7D32]"></div></div>;

    return (
        <div className="min-h-screen bg-[#FFF8F0] p-6 md:p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                            {role === 'NGO' ? 'Uploaded Needs' : 'Community Needs'}
                        </h1>
                        <p className="text-gray-500 mt-2 text-lg">
                            {role === 'NGO' ? 'Manage your posted requirements' : 'Browse and support NGO requirements'}
                        </p>
                    </div>
                    {role === 'NGO' && (
                        <button
                            onClick={() => navigate('/upload-need')}
                            className="bg-[#2E7D32] text-white px-6 py-3 rounded-full font-bold shadow-md hover:bg-[#1B5E20] hover:shadow-lg transition-all flex items-center gap-2 active:scale-95"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            Post New Need
                        </button>
                    )}
                </div>

                {needs.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
                        <svg className="mx-auto h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Requirements Found</h3>
                        <p className="text-gray-500">
                            {role === 'NGO' ? "You haven't posted any requirements yet." : "There are currently no active requirements."}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {needs.map((need) => (
                            <div key={need.requirementid} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group flex flex-col">
                                <div className="p-6 flex-grow">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex gap-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getUrgencyColor(need.urgency)}`}>
                                                {need.urgency}
                                            </span>
                                            {!need.isActive && (
                                                <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-gray-300">
                                                    Closed
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
                                                {new Date(need.createdAt).toLocaleDateString()}
                                            </span>
                                            {role === 'NGO' && (
                                                <button
                                                    onClick={() => handleDelete(need.requirementid)}
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-full transition-colors"
                                                    title="Delete Requirement"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#2E7D32] transition-colors">{need.title}</h3>

                                    <div className="mb-3">
                                        <div className="flex justify-between text-xs font-bold text-gray-500 mb-1 leading-tight">
                                            <span>Fulfilled Progress</span>
                                            <span>{need.fulfilledQuantity || 0} / {need.quantity}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-[#2E7D32] h-2 rounded-full"
                                                style={{ width: `${Math.min(((need.fulfilledQuantity || 0) / need.quantity) * 100, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-lg text-xs font-semibold">{need.category}</span>
                                        <span className="text-sm font-medium text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg">{need.quantity} required</span>
                                    </div>

                                    <p className="text-gray-600 text-sm mb-6 line-clamp-3 bg-gray-50 p-3 rounded-xl">{need.description}</p>

                                    {need.username && role !== 'NGO' && (
                                        <div className="flex items-center gap-3 mt-auto pt-4 border-t border-gray-100">
                                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#2E7D32] to-[#1B5E20] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                                                {need.username.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-gray-900">{need.username}</span>
                                                    {need.isverified === 'VERIFIED' && (
                                                        <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20" title="Verified NGO">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <span className="text-xs text-gray-500">Organization</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {role === 'DONOR' && (
                                    <div className="p-4 bg-gray-50 border-t border-gray-100">
                                        <button
                                            onClick={() => navigate(`/donate/${need.userid}`, { state: { requirement: need } })}
                                            className="w-full bg-white text-[#2E7D32] border-2 border-[#2E7D32] py-2.5 rounded-xl font-bold hover:bg-[#2E7D32] hover:text-white transition-colors duration-300 shadow-sm"
                                        >
                                            Donate Now
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Needs;
