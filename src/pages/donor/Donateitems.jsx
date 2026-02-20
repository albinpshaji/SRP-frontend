import { useState, useEffect } from "react";
import api from "../../services/api";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import donateVisual from '../../assets/loginimage.jpg';

function Donateitems() {
    const { id } = useParams(); 
    const navigate = useNavigate();
    const location = useLocation();

    const isDirectDonation = Boolean(id);
    
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState("Food");
    const [logistics, setLogistics] = useState("Dropoff");
    const [pickuplocation, setPickupLocation] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const pageTitle = isDirectDonation ? "Donate to NGO" : "List on Marketplace";
    const submitBtnText = isDirectDonation ? "Confirm Donation" : "List Item";
    const successRedirect = isDirectDonation ? "/ngos" : "/mydonations";

    // CLEARS ADDRESS WHEN DROPOFF IS SELECTED
    useEffect(() => {
        if (logistics === "Dropoff") {
            setPickupLocation("");
        }
    }, [logistics]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
            if (!allowedTypes.includes(file.type)) {
                alert("Please upload a valid image (JPG, JPEG, or PNG).");
                e.target.value = null;
                return;
            }
            setImageFile(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!imageFile) {
            alert("Please upload an image of the item.");
            return;
        }

        // Final check to ensure no address is sent if dropoff
        if (logistics === "Pickup" && !pickuplocation.trim()) {
            alert("Please enter a pickup address.");
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();

            const donationData = {
                title,
                description,
                category,
                logistics,
                pickuplocation,
                recepientid: isDirectDonation ? parseInt(id) : null 
            };

            formData.append("data", new Blob([JSON.stringify(donationData)], {
                type: 'application/json'
            }));

            formData.append("imagefile", imageFile);

            await api.post('/ngos/donate', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            alert(isDirectDonation ? 'Donation submitted successfully!' : 'Item listed in marketplace successfully!');
            navigate(successRedirect);
        } catch (error) {
            console.error("Upload failed:", error.response?.data || error.message);
            alert("Failed to submit: " + (error.response?.data || "Server Error"));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-[#FFF8F0] p-4 sm:p-8">
            <div className="flex flex-col md:flex-row w-full max-w-4xl bg-white rounded-[2rem] shadow-2xl overflow-hidden h-auto -mt-10 md:-mt-20">
                
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

                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center order-2">
                    <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center md:text-left">{pageTitle}</h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">Item Title</label>
                            <input 
                                value={title} 
                                onChange={(e) => setTitle(e.target.value)} 
                                required 
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-600 outline-none" 
                                placeholder="e.g. 20kg Rice Bags"
                            />
                        </div>

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

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1">Category</label>
                                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white">
                                    <option value="Food">Food</option>
                                    <option value="Clothes">Clothes</option>
                                    <option value="Medicine">Medicine</option>
                                    <option value="Books">Books</option>
                                    <option value="Electronics">Electronics</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1">Logistics</label>
                                <select value={logistics} onChange={(e) => setLogistics(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white">
                                    <option value="Dropoff">I will Drop-off</option>
                                    <option value="Pickup">Pickup Required</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">Pickup Address</label>
                            <input 
                                value={pickuplocation} 
                                onChange={(e) => setPickupLocation(e.target.value)} 
                                required={logistics === "Pickup"}
                                disabled={logistics === "Dropoff"}
                                className={`w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-600 outline-none ${logistics === 'Dropoff' ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`}
                                placeholder={logistics === 'Dropoff' ? "Not applicable for drop-off" : "Enter pickup address"}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">Description</label>
                            <textarea 
                                value={description} 
                                onChange={(e) => setDescription(e.target.value)} 
                                rows="2" 
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 resize-none" 
                                placeholder="Details about quantity, condition, expiry..."
                            />
                        </div>

                        <button 
                            type='submit' 
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