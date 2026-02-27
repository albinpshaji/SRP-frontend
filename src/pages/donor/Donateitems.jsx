import { useState, useEffect } from "react";
import api from "../../services/api";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import donateVisual from '../../assets/loginimage.jpg';

function Donateitems() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    // Check if a requirement object was passed via React Router state (from Needs.jsx)
    const requirement = location.state?.requirement;

    const isDirectDonation = Boolean(id);

    const [title, setTitle] = useState(requirement ? requirement.title : '');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState(requirement ? requirement.category : "Food");
    const [logistics, setLogistics] = useState("Dropoff");
    const [pickuplocation, setPickupLocation] = useState("");
    const [pickupdate, setPickupdate] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [quantityProvided, setQuantityProvided] = useState(1);
    const [loading, setLoading] = useState(false);

    let pageTitle = isDirectDonation ? "Donate to NGO" : "List on Marketplace";
    if (requirement) {
        pageTitle = "Fulfill NGO Requirement";
    }
    const submitBtnText = isDirectDonation ? "Confirm Donation" : "List Item";
    const successRedirect = isDirectDonation ? "/ngos" : "/mydonations";

    // CLEARS ADDRESS AND DATE WHEN DROPOFF IS SELECTED
    useEffect(() => {
        if (logistics === "Dropoff") {
            setPickupLocation("");
            setPickupdate("");
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
                logistics: {
                    method: logistics,
                    address_line: logistics === "Pickup" ? pickuplocation : null,
                    pickupdate: logistics === "Pickup" && pickupdate ? pickupdate : null,
                },
                recepientid: isDirectDonation ? parseInt(id) : null,
                requirementid: requirement ? requirement.requirementid : null,
                quantityProvided: requirement ? parseInt(quantityProvided) : null
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
                        {!requirement && (
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
                        )}

                        {requirement && (
                            <div className="bg-green-50/50 border border-green-100 rounded-2xl p-5 mb-6 shadow-sm">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <span className="bg-green-100 text-green-800 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
                                            Fulfilling Need
                                        </span>
                                        <h4 className="text-xl font-extrabold text-gray-900 mt-2 mb-1 line-clamp-2">{requirement.title}</h4>
                                        <p className="text-sm font-medium text-gray-500">{requirement.category}</p>
                                    </div>
                                </div>

                                <div className="mt-4 mb-5">
                                    <div className="flex justify-between text-sm font-bold text-gray-600 mb-1.5">
                                        <span>Progress</span>
                                        <span className="text-green-700">{requirement.fulfilledQuantity || 0} / {requirement.quantity} Fulfilled</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                        <div
                                            className="bg-green-600 h-2.5 rounded-full transition-all duration-500"
                                            style={{ width: `${Math.min(((requirement.fulfilledQuantity || 0) / requirement.quantity) * 100, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="bg-white p-4 rounded-xl border border-green-50">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Quantity You Are Donating</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="1"
                                            max={requirement.quantity - (requirement.fulfilledQuantity || 0)}
                                            value={quantityProvided}
                                            onChange={(e) => setQuantityProvided(e.target.value)}
                                            required
                                            className="w-full px-4 pr-16 py-3 rounded-xl border-2 border-green-100 focus:border-green-500 focus:ring-0 outline-none text-lg font-bold text-gray-800 transition-colors"
                                            placeholder="Enter amount..."
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                            <span className="text-gray-400 font-medium">Items</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2 font-medium bg-gray-50 p-2 rounded-lg">Max needed: {requirement.quantity - (requirement.fulfilledQuantity || 0)}</p>
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
                            <div className={`grid grid-cols-1 ${requirement ? 'md:grid-cols-1' : 'md:grid-cols-2'} gap-4`}>
                                {!requirement && (
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-600 mb-1">Category</label>
                                        <select
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
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

                            <div
                                className={`transition-all duration-500 ease-in-out overflow-hidden ${logistics === 'Pickup' ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'}`}
                            >
                                <div>
                                    <label className="block text-sm font-semibold text-gray-600 mb-1">Preferred Pickup Date & Time</label>
                                    <input
                                        type="datetime-local"
                                        value={pickupdate}
                                        onChange={(e) => setPickupdate(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-600 outline-none"
                                    />
                                </div>
                            </div>


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
                </div >
            </div >
        </div >
    );
}

export default Donateitems;