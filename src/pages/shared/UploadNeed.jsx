import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const UploadNeed = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        urgency: 'NORMAL',
        quantity: '',
        description: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/requirements', {
                ...formData,
                quantity: parseInt(formData.quantity)
            });
            showToast("Requirement posted successfully!", "success");
            navigate('/needs');
        } catch (error) {
            console.error('Error posting need:', error);
            showToast('Failed to post requirement. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const inputClasses = "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-700 outline-none focus:ring-2 focus:ring-[#2E7D32]/50 focus:border-[#2E7D32] transition-all duration-300 placeholder:text-gray-400";
    const labelClasses = "block text-sm font-bold text-gray-700 mb-2 ml-1";

    return (
        <div className="min-h-screen bg-[#FFF8F0] py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] p-8 text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
                        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>
                        <h2 className="text-3xl font-extrabold text-white relative z-10">Post a Requirement</h2>
                        <p className="text-green-100 mt-2 font-medium relative z-10">Let the community know what you need</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        <div>
                            <label htmlFor="title" className={labelClasses}>Requirement Title</label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                required
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g., Winter Blankets for Shelter"
                                className={inputClasses}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="category" className={labelClasses}>Category</label>
                                <select
                                    id="category"
                                    name="category"
                                    required
                                    value={formData.category}
                                    onChange={handleChange}
                                    className={`${inputClasses} appearance-none cursor-pointer`}
                                >
                                    <option value="" disabled>Select Category</option>
                                    <option value="Food">Food</option>
                                    <option value="Clothing">Clothing</option>
                                    <option value="Medical">Medical Supplies</option>
                                    <option value="Education">Educational Materials</option>
                                    <option value="Shelter">Shelter Supplies</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="quantity" className={labelClasses}>Quantity Required</label>
                                <input
                                    type="number"
                                    id="quantity"
                                    name="quantity"
                                    required
                                    min="1"
                                    value={formData.quantity}
                                    onChange={handleChange}
                                    placeholder="e.g., 50"
                                    className={inputClasses}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="urgency" className={labelClasses}>Urgency Level</label>
                            <div className="grid grid-cols-3 gap-4">
                                {['NORMAL', 'URGENT', 'SOS'].map((level) => (
                                    <label
                                        key={level}
                                        className={`
                      cursor-pointer border-2 rounded-xl py-3 px-2 text-center text-sm font-bold transition-all duration-200
                      ${formData.urgency === level
                                                ? (level === 'SOS' ? 'bg-red-50 border-red-500 text-red-700' :
                                                    level === 'URGENT' ? 'bg-orange-50 border-orange-500 text-orange-700' :
                                                        'bg-blue-50 border-blue-500 text-blue-700')
                                                : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                                            }
                    `}
                                    >
                                        <input
                                            type="radio"
                                            name="urgency"
                                            value={level}
                                            checked={formData.urgency === level}
                                            onChange={handleChange}
                                            className="hidden"
                                        />
                                        {level}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="description" className={labelClasses}>Detailed Description</label>
                            <textarea
                                id="description"
                                name="description"
                                rows="4"
                                required
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe exactly what you need and why..."
                                className={`${inputClasses} resize-none`}
                            ></textarea>
                        </div>

                        <div className="pt-4 flex gap-4">
                            <button
                                type="button"
                                onClick={() => navigate('/needs')}
                                className="flex-1 bg-white text-gray-700 border-2 border-gray-200 py-3.5 px-6 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-300 transition-all duration-300"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-[#2E7D32] text-white py-3.5 px-6 rounded-xl font-bold shadow-lg hover:bg-[#1B5E20] hover:shadow-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                            >
                                {loading ? (
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : 'Post Requirement'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UploadNeed;
